package com.smartfisheries.mapper;

import com.smartfisheries.dto.CertificationDto;
import com.smartfisheries.entity.DigitalCertification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DigitalCertificationMapper {

    @Mapping(source = "farmer.id", target = "farmerId")
    @Mapping(target = "farmerName", expression = "java(cert.getFarmer() != null ? cert.getFarmer().getFirstName() + \" \" + cert.getFarmer().getLastName() : null)")
    @Mapping(source = "reviewer.id", target = "reviewerId")
    @Mapping(target = "reviewerName", expression = "java(cert.getReviewer() != null ? cert.getReviewer().getFirstName() + \" \" + cert.getReviewer().getLastName() : null)")
    CertificationDto.CertificationResponse toResponse(DigitalCertification cert);
}
