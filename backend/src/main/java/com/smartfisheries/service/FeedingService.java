package com.smartfisheries.service;

import com.smartfisheries.dto.FeedingDto;
import com.smartfisheries.entity.*;
import com.smartfisheries.exception.BadRequestException;
import com.smartfisheries.exception.ResourceNotFoundException;
import com.smartfisheries.mapper.FeedingMapper;
import com.smartfisheries.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedingService {

    private final FeedingRecordRepository feedingRecordRepository;
    private final FeedingScheduleRepository feedingScheduleRepository;
    private final FeedTypeRepository feedTypeRepository;
    private final PondRepository pondRepository;
    private final PondStockRepository pondStockRepository;
    private final UserRepository userRepository;
    private final FcrService fcrService;
    private final FeedingMapper feedingMapper;

    @Transactional
    public FeedingDto.FeedingRecordResponse recordFeeding(Long farmerId, Long stockId, FeedingDto.FeedingRecordRequest request) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond's stock");
        }

        if (stock.getStatus() == PondStockStatus.HARVESTED) {
            throw new BadRequestException("Cannot log feeding records for a harvested batch");
        }

        FeedType feedType = feedTypeRepository.findById(request.feedTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Feed type not found"));

        User recordedBy = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FeedingRecord record = FeedingRecord.builder()
                .pondStock(stock)
                .feedType(feedType)
                .quantityKg(request.quantityKg())
                .fedAt(request.fedAt())
                .recordedBy(recordedBy)
                .build();

        FeedingRecord savedRecord = feedingRecordRepository.save(record);

        // Recalculate FCR immediately to update statistics
        fcrService.calculateAndSaveFcr(stockId);

        return feedingMapper.toRecordResponse(savedRecord);
    }

    @Transactional
    public FeedingDto.FeedingScheduleResponse createSchedule(Long farmerId, Long pondId, FeedingDto.FeedingScheduleRequest request) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own this pond");
        }

        FeedType feedType = feedTypeRepository.findById(request.feedTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Feed type not found"));

        FeedingSchedule schedule = FeedingSchedule.builder()
                .pond(pond)
                .feedType(feedType)
                .timeOfDay(request.timeOfDay())
                .quantityKg(request.quantityKg())
                .active(request.isActive() != null ? request.isActive() : true)
                .build();

        FeedingSchedule savedSchedule = feedingScheduleRepository.save(schedule);
        return feedingMapper.toScheduleResponse(savedSchedule);
    }

    public List<FeedingDto.FeedingScheduleResponse> getSchedules(Long farmerId, Long pondId) {
        Pond pond = pondRepository.findById(pondId)
                .orElseThrow(() -> new ResourceNotFoundException("Pond not found"));

        if (!pond.getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this pond");
        }

        return feedingScheduleRepository.findByPondId(pondId).stream()
                .map(feedingMapper::toScheduleResponse)
                .toList();
    }

    public List<FeedingDto.FeedingRecordResponse> getFeedingHistory(Long farmerId, Long stockId) {
        PondStock stock = pondStockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found"));

        if (!stock.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("Access denied: You do not own this stock's pond");
        }

        return feedingRecordRepository.findByPondStockIdOrderByFedAtDesc(stockId).stream()
                .map(feedingMapper::toRecordResponse)
                .toList();
    }

    @Transactional
    public FeedingDto.FeedingScheduleResponse updateSchedule(Long farmerId, Long scheduleId, FeedingDto.FeedingScheduleRequest request) {
        FeedingSchedule schedule = feedingScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Feeding schedule not found"));

        if (!schedule.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own the pond for this schedule");
        }

        FeedType feedType = feedTypeRepository.findById(request.feedTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Feed type not found"));

        schedule.setFeedType(feedType);
        schedule.setTimeOfDay(request.timeOfDay());
        schedule.setQuantityKg(request.quantityKg());
        if (request.isActive() != null) {
            schedule.setActive(request.isActive());
        }

        FeedingSchedule updated = feedingScheduleRepository.save(schedule);
        return feedingMapper.toScheduleResponse(updated);
    }

    @Transactional
    public void deleteSchedule(Long farmerId, Long scheduleId) {
        FeedingSchedule schedule = feedingScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Feeding schedule not found"));

        if (!schedule.getPond().getFarmer().getId().equals(farmerId)) {
            throw new BadRequestException("You do not own the pond for this schedule");
        }

        feedingScheduleRepository.delete(schedule);
    }

    public List<FeedingDto.FeedTypeResponse> listFeedTypes() {
        return feedTypeRepository.findAll().stream()
                .map(feedingMapper::toFeedTypeResponse)
                .toList();
    }
}
