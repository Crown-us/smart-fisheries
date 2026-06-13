package com.smartfisheries.mapper;

import com.smartfisheries.dto.WaterQualityDto;
import com.smartfisheries.entity.WaterQualityRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WaterQualityMapper {

    @Mapping(source = "pond.id", target = "pondId")
    @Mapping(source = "pond.name", target = "pondName")
    @Mapping(source = "recordedBy.id", target = "recordedById")
    @Mapping(target = "recordedByName", expression = "java(record.getRecordedBy() != null ? record.getRecordedBy().getFirstName() + \" \" + record.getRecordedBy().getLastName() : null)")
    WaterQualityDto.WaterQualityResponse toResponse(WaterQualityRecord record);
}
