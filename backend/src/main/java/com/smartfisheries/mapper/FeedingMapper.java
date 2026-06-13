package com.smartfisheries.mapper;

import com.smartfisheries.dto.FeedingDto;
import com.smartfisheries.entity.FeedType;
import com.smartfisheries.entity.FeedingRecord;
import com.smartfisheries.entity.FeedingSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeedingMapper {

    @Mapping(source = "pondStock.id", target = "pondStockId")
    @Mapping(source = "feedType.id", target = "feedTypeId")
    @Mapping(source = "feedType.name", target = "feedTypeName")
    @Mapping(source = "recordedBy.id", target = "recordedById")
    @Mapping(target = "recordedByName", expression = "java(record.getRecordedBy() != null ? record.getRecordedBy().getFirstName() + \" \" + record.getRecordedBy().getLastName() : null)")
    FeedingDto.FeedingRecordResponse toRecordResponse(FeedingRecord record);

    @Mapping(source = "pond.id", target = "pondId")
    @Mapping(source = "feedType.id", target = "feedTypeId")
    @Mapping(source = "feedType.name", target = "feedTypeName")
    FeedingDto.FeedingScheduleResponse toScheduleResponse(FeedingSchedule schedule);

    FeedingDto.FeedTypeResponse toFeedTypeResponse(FeedType feedType);
}
