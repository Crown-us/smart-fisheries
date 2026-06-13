package com.smartfisheries.service;

import com.smartfisheries.dto.FarmDto;
import com.smartfisheries.entity.*;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.mapper.PondMapper;
import com.smartfisheries.repository.FishSpeciesRepository;
import com.smartfisheries.repository.PondRepository;
import com.smartfisheries.repository.PondStockRepository;
import com.smartfisheries.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final PondRepository pondRepository;
    private final UserRepository userRepository;
    private final FishSpeciesRepository fishSpeciesRepository;
    private final PondStockRepository pondStockRepository;
    private final PondMapper pondMapper;

    @Transactional
    public FarmDto.PondResponse createPond(Long farmerId, FarmDto.PondRequest request) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

        if (farmer.getRole() != UserRole.FARMER && farmer.getRole() != UserRole.ADMIN) {
            throw new BadRequestException("Only farmers can create ponds");
        }

        Pond pond = Pond.builder()
                .farmer(farmer)
                .name(request.name())
                .location(request.location())
                .length(request.length())
                .width(request.width())
                .depth(request.depth())
                .waterSource(request.waterSource())
                .status(request.status() != null ? request.status() : PondStatus.ACTIVE)
                .build();

        Pond savedPond = pondRepository.save(pond);
        return pondMapper.toPondResponse(savedPond);
    }

    @Transactional
    public FarmDto.PondResponse updatePond(Long farmerId, Long pondId, FarmDto.PondRequest request) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        // Validate ownership
        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        pond.setName(request.name());
        pond.setLocation(request.location());
        pond.setLength(request.length());
        pond.setWidth(request.width());
        pond.setDepth(request.depth());
        pond.setWaterSource(request.waterSource());
        if (request.status() != null) {
            pond.setStatus(request.status());
        }

        Pond updatedPond = pondRepository.save(pond);
        return pondMapper.toPondResponse(updatedPond);
    }

    @Transactional
    public void deletePond(Long farmerId, Long pondId) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        pondRepository.delete(pond);
    }

    public FarmDto.PondResponse getPond(Long farmerId, Long pondId) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond");
        }

        return pondMapper.toPondResponse(pond);
    }

    public List<FarmDto.PondResponse> listFarmerPonds(Long farmerId) {
        List<Pond> ponds = pondRepository.findByFarmerId(farmerId);
        return ponds.stream()
                .map(pondMapper::toPondResponse)
                .toList();
    }

    @Transactional
    public FarmDto.PondStockResponse stockPond(Long farmerId, Long pondId, FarmDto.PondStockRequest request) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        // Check if pond already has an active stock batch
        List<PondStock> activeStocks = pondStockRepository.findByPondIdAndStatus(pondId, PondStockStatus.ACTIVE);
        if (!activeStocks.isEmpty()) {
            throw new BadRequestException("Pond already contains an active cultivation batch. Harvest it first.");
        }

        FishSpecies species = fishSpeciesRepository.findById(request.fishSpeciesId())
                .orElseThrow(() -> new ResourceNotFoundException("Fish species not found"));

        PondStock stock = PondStock.builder()
                .pond(pond)
                .fishSpecies(species)
                .initialQuantity(request.initialQuantity())
                .currentQuantity(request.initialQuantity())
                .initialWeightG(request.initialWeightG())
                .currentWeightG(request.initialWeightG())
                .stockedAt(request.stockedAt())
                .status(PondStockStatus.ACTIVE)
                .build();

        PondStock savedStock = pondStockRepository.save(stock);
        return pondMapper.toPondStockResponse(savedStock);
    }

    @Transactional
    public FarmDto.PondStockResponse harvestStock(Long farmerId, Long pondId, Long stockId) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getId().equals(pondId)) {
            throw new BadRequestException("This stock batch does not belong to the specified pond");
        }

        if (stock.getStatus() == PondStockStatus.HARVESTED) {
            throw new BadRequestException("Cultivation batch is already harvested");
        }

        stock.setStatus(PondStockStatus.HARVESTED);
        stock.setHarvestedAt(LocalDateTime.now());
        PondStock savedStock = pondStockRepository.save(stock);

        return pondMapper.toPondStockResponse(savedStock);
    }

    @Transactional
    public FarmDto.PondStockResponse updateCurrentWeight(Long farmerId, Long stockId, Double currentWeightG, Integer currentQuantity) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this stock's pond");
        }

        if (stock.getStatus() == PondStockStatus.HARVESTED) {
            throw new BadRequestException("Cannot update weight on a harvested batch");
        }

        if (currentWeightG != null) {
            if (currentWeightG < stock.getCurrentWeightG()) {
                throw new BadRequestException("New weight cannot be lower than previous recorded weight");
            }
            stock.setCurrentWeightG(currentWeightG);
        }

        if (currentQuantity != null) {
            if (currentQuantity > stock.getInitialQuantity()) {
                throw new BadRequestException("Current quantity cannot exceed initial stocked quantity");
            }
            stock.setCurrentQuantity(currentQuantity);
        }

        PondStock updatedStock = pondStockRepository.save(stock);
        return pondMapper.toPondStockResponse(updatedStock);
    }

    public List<FarmDto.FishSpeciesResponse> listFishSpecies() {
        return fishSpeciesRepository.findAll().stream()
                .map(pondMapper::toFishSpeciesResponse)
                .toList();
    }
}
