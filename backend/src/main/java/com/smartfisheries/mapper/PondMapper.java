package com.smartfisheries.mapper;

import com.smartfisheries.dto.FarmDto;
import com.smartfisheries.entity.FishSpecies;
import com.smartfisheries.entity.Pond;
import com.smartfisheries.entity.PondStock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PondMapper {

    @Mapping(source = "farmer.id", target = "farmerId")
    @Mapping(target = "farmerName", expression = "java(pond.getFarmer() != null ? pond.getFarmer().getFirstName() + \" \" + pond.getFarmer().getLastName() : null)")
    FarmDto.PondResponse toPondResponse(Pond pond);

    @Mapping(source = "pond.id", target = "pondId")
    @Mapping(source = "pond.name", target = "pondName")
    @Mapping(source = "fishSpecies.id", target = "fishSpeciesId")
    @Mapping(source = "fishSpecies.name", target = "fishSpeciesName")
    FarmDto.PondStockResponse toPondStockResponse(PondStock stock);

    FarmDto.FishSpeciesResponse toFishSpeciesResponse(FishSpecies species);
}
