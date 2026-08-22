package com.pathshala.config;

import com.pathshala.entity.ModuleCode;
import com.pathshala.entity.PlatformModule;
import com.pathshala.entity.Province;
import com.pathshala.entity.District;
import com.pathshala.entity.Municipality;
import com.pathshala.entity.Ward;
import com.pathshala.entity.RoleName;
import com.pathshala.entity.User;
import com.pathshala.entity.School;
import com.pathshala.entity.SchoolModule;
import com.pathshala.entity.SubscriptionPlan;
import com.pathshala.entity.SubscriptionPlanModule;
import com.pathshala.entity.BillingType;
import com.pathshala.entity.BillingPeriod;
import com.pathshala.entity.PricingModel;
import com.pathshala.repository.Repositories.ModuleRepository;
import com.pathshala.repository.Repositories.DistrictRepository;
import com.pathshala.repository.Repositories.MunicipalityRepository;
import com.pathshala.repository.Repositories.ProvinceRepository;
import com.pathshala.repository.Repositories.UserRepository;
import com.pathshala.repository.Repositories.WardRepository;
import com.pathshala.repository.Repositories.SchoolRepository;
import com.pathshala.repository.Repositories.SchoolModuleRepository;
import com.pathshala.repository.Repositories.SubscriptionPlanRepository;
import com.pathshala.repository.Repositories.SubscriptionPlanModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final MunicipalityRepository municipalityRepository;
    private final WardRepository wardRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionPlanModuleRepository subscriptionPlanModuleRepository;

    private static final Map<ModuleCode, String> MODULE_NAMES;
    private static final Set<ModuleCode> REQUIRED = Set.of(ModuleCode.STUDENT_MANAGEMENT, ModuleCode.SUBJECT_MANAGEMENT, ModuleCode.EXAMINATION);
    private static final Set<ModuleCode> INCLUDED = Set.of(ModuleCode.TEACHER_MANAGEMENT, ModuleCode.TEACHER_ASSIGNMENT, ModuleCode.ATTENDANCE, ModuleCode.PARENT_MANAGEMENT);
    private static final Set<ModuleCode> PAID = Set.of(ModuleCode.ASSIGNMENT, ModuleCode.TIMETABLE, ModuleCode.FEE_MANAGEMENT,
            ModuleCode.ACADEMIC_CALENDAR, ModuleCode.STUDENT_DASHBOARD, ModuleCode.TEACHER_DASHBOARD,
            ModuleCode.PARENT_DASHBOARD, ModuleCode.CERTIFICATES);
    private static final Set<ModuleCode> FUTURE_MODULES = Set.of(ModuleCode.HOSTEL, ModuleCode.TRANSPORT, ModuleCode.INVENTORY,
            ModuleCode.HR_MANAGEMENT, ModuleCode.PAYROLL, ModuleCode.ACCOUNTS, ModuleCode.ANALYTICS_DASHBOARD, ModuleCode.LIBRARY);
    static {
        Map<ModuleCode, String> map = new HashMap<>();
        map.put(ModuleCode.STUDENT_MANAGEMENT, "Student Registration");
        map.put(ModuleCode.TEACHER_MANAGEMENT, "Teacher Registration");
        map.put(ModuleCode.SUBJECT_MANAGEMENT, "Class & Subject Management");
        map.put(ModuleCode.TEACHER_ASSIGNMENT, "Teacher Assignment");
        map.put(ModuleCode.PARENT_MANAGEMENT, "Parent / Guardian Management");
        map.put(ModuleCode.ATTENDANCE, "Attendance Management");
        map.put(ModuleCode.EXAMINATION, "Examination & Result Publishing");
        map.put(ModuleCode.ASSIGNMENT, "Assignment Management");
        map.put(ModuleCode.FEE_MANAGEMENT, "Fee Management");
        map.put(ModuleCode.HOSTEL, "Hostel Management");
        map.put(ModuleCode.TRANSPORT, "Transport Management");
        map.put(ModuleCode.ACADEMIC_CALENDAR, "Academic Calendar");
        map.put(ModuleCode.TIMETABLE, "Timetable Management");
        map.put(ModuleCode.PARENT_DASHBOARD, "Parent Dashboard");
        map.put(ModuleCode.CERTIFICATES, "Certificates");
        map.put(ModuleCode.STUDENT_DASHBOARD, "Student Dashboard");
        map.put(ModuleCode.TEACHER_DASHBOARD, "Teacher Dashboard");
        MODULE_NAMES = map;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (ModuleCode code : ModuleCode.values()) {
            PlatformModule platformModule = moduleRepository.findByCode(code).orElseGet(() -> module(code));
            String name = moduleName(code);
            BillingType billingType = REQUIRED.contains(code) ? BillingType.REQUIRED : INCLUDED.contains(code) ? BillingType.INCLUDED
                    : PAID.contains(code) ? BillingType.PAID : BillingType.COMING_SOON;
            boolean internal = code == ModuleCode.LEAVE_MANAGEMENT || code == ModuleCode.NOTIFICATIONS;
            boolean available = billingType != BillingType.COMING_SOON;
            platformModule.setName(name);
            platformModule.setDescription(name + " module");
            platformModule.setBillingType(billingType);
            platformModule.setBillingPeriod(BillingPeriod.ANNUAL);
            platformModule.setAnnualPrice(billingType == BillingType.PAID ? new BigDecimal("3000.00") : null);
            platformModule.setActive(available);
            platformModule.setSelectable(available);
            platformModule.setComingSoon(FUTURE_MODULES.contains(code));
            platformModule.setCategory(internal ? null : billingType.name());
            platformModule.setRequired(billingType == BillingType.REQUIRED);
            moduleRepository.save(platformModule);
        }

        User superAdmin = userRepository.findByUsernameAndDeletedFalse("superadmin")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("superadmin");
                    u.setEmail("superadmin@360pathshala.com");
                    u.setActive(true);
                    u.setRoles(new java.util.HashSet<>(java.util.List.of(RoleName.SUPER_ADMIN)));
                    return u;
                });
        superAdmin.setPassword(passwordEncoder.encode("superadmin"));
        superAdmin.setFullName("Super Admin");
        userRepository.save(superAdmin);

        seedLocationData();
        seedSubscriptionPlans();
    }

    private void seedSubscriptionPlans() {
        for (String code : List.of("BASIC", "STANDARD", "PREMIUM")) subscriptionPlanRepository.findByCode(code).ifPresent(plan -> {
            plan.setActive(false); plan.setPricingModel(PricingModel.LEGACY_FIXED); subscriptionPlanRepository.save(plan);
        });
        SubscriptionPlan plan = subscriptionPlanRepository.findByCode("FEATURE_ADDONS").orElseGet(SubscriptionPlan::new);
        plan.setCode("FEATURE_ADDONS"); plan.setName("Subscription & Features"); plan.setMonthlyPrice(BigDecimal.ZERO);
        plan.setDurationDays(365); plan.setCurrency("NPR"); plan.setDescription("Technical feature purchase plan");
        plan.setActive(false); plan.setPricingModel(PricingModel.FEATURE_BASED); subscriptionPlanRepository.save(plan);
    }

    private void seedPlan(String code, String name, BigDecimal defaultPrice, Set<ModuleCode> moduleCodes) {
        SubscriptionPlan plan = subscriptionPlanRepository.findByCode(code).orElseGet(() -> {
            SubscriptionPlan created = new SubscriptionPlan(); created.setCode(code); created.setName(name);
            created.setMonthlyPrice(defaultPrice); created.setDurationDays(30); created.setCurrency("NPR");
            created.setDescription(name + " subscription plan"); created.setActive(true);
            return subscriptionPlanRepository.save(created);
        });
        if (subscriptionPlanModuleRepository.findByPlanId(plan.getId()).isEmpty()) {
            for (ModuleCode moduleCode : moduleCodes) {
                SubscriptionPlanModule link = new SubscriptionPlanModule(); link.setPlan(plan); link.setModuleCode(moduleCode);
                subscriptionPlanModuleRepository.save(link);
            }
        }
    }

    private void seedLocationData() {
        if (provinceRepository.count() > 0) return;

        List<Province> provinces = List.of(
                createProvince("Koshi", "KP01"),
                createProvince("Madhesh", "KP02"),
                createProvince("Bagmati", "KP03"),
                createProvince("Gandaki", "KP04"),
                createProvince("Lumbini", "KP05"),
                createProvince("Karnali", "KP06"),
                createProvince("Sudurpashchim", "KP07")
        );
        provinceRepository.saveAll(provinces);

        Map<String, Province> provinceMap = new HashMap<>();
        for (int i = 0; i < provinces.size(); i++) {
            provinceMap.put(provinces.get(i).getName(), provinces.get(i));
        }

        List<DistrictSeed> districtSeeds = List.of(
                new DistrictSeed("Taplejung", "TP", "Koshi"),
                new DistrictSeed("Panchthar", "PP", "Koshi"),
                new DistrictSeed("Ilam", "IL", "Koshi"),
                new DistrictSeed("Jhapa", "JP", "Koshi"),
                new DistrictSeed("Morang", "MR", "Koshi"),
                new DistrictSeed("Sunsari", "SS", "Koshi"),
                new DistrictSeed("Dhankuta", "DK", "Koshi"),
                new DistrictSeed("Terhathum", "TH", "Koshi"),
                new DistrictSeed("Sankhuwasabha", "SK", "Koshi"),
                new DistrictSeed("Bhojpur", "BP", "Koshi"),
                new DistrictSeed("Khotang", "KH", "Koshi"),
                new DistrictSeed("Okhaldhunga", "OK", "Koshi"),
                new DistrictSeed("Udayapur", "UD", "Koshi"),
                new DistrictSeed("Saptari", "SA", "Madhesh"),
                new DistrictSeed("Siraha", "SI", "Madhesh"),
                new DistrictSeed("Dhanusha", "DH", "Madhesh"),
                new DistrictSeed("Mahottari", "MH", "Madhesh"),
                new DistrictSeed("Sarlahi", "SL", "Madhesh"),
                new DistrictSeed("Rautahat", "RA", "Madhesh"),
                new DistrictSeed("Bara", "BR", "Madhesh"),
                new DistrictSeed("Parsa", "PA", "Madhesh"),
                new DistrictSeed("Kathmandu", "KA", "Bagmati"),
                new DistrictSeed("Lalitpur", "LA", "Bagmati"),
                new DistrictSeed("Bhaktapur", "BA", "Bagmati"),
                new DistrictSeed("Rasuwa", "RS", "Bagmati"),
                new DistrictSeed("Nuwakot", "NW", "Bagmati"),
                new DistrictSeed("Sindhupalchok", "SP", "Bagmati"),
                new DistrictSeed("Ramechhap", "RM", "Bagmati"),
                new DistrictSeed("Dolakha", "DO", "Bagmati"),
                new DistrictSeed("Sindhuli", "SI", "Bagmati"),
                new DistrictSeed("Makwanpur", "MK", "Bagmati"),
                new DistrictSeed("Chitwan", "CH", "Bagmati"),
                new DistrictSeed("Gorkha", "GO", "Bagmati"),
                new DistrictSeed("Lamjung", "LJ", "Bagmati"),
                new DistrictSeed("Tanahu", "TN", "Bagmati"),
                new DistrictSeed("Manang", "MA", "Gandaki"),
                new DistrictSeed("Mustang", "MU", "Gandaki"),
                new DistrictSeed("Myagdi", "MY", "Gandaki"),
                new DistrictSeed("Baglung", "BG", "Gandaki"),
                new DistrictSeed("Parbat", "PB", "Gandaki"),
                new DistrictSeed("Kaski", "KS", "Gandaki"),
                new DistrictSeed("Syangja", "SY", "Gandaki"),
                new DistrictSeed("Arghakhanchi", "AR", "Gandaki"),
                new DistrictSeed("Gulmi", "GM", "Gandaki"),
                new DistrictSeed("Palpa", "PL", "Gandaki"),
                new DistrictSeed("Pyuthan", "PY", "Gandaki"),
                new DistrictSeed("Rolpa", "RR", "Gandaki"),
                new DistrictSeed("Rukum", "RK", "Gandaki"),
                new DistrictSeed("Rupandehi", "RP", "Lumbini"),
                new DistrictSeed("Nawalparasi", "NP", "Lumbini"),
                new DistrictSeed("Dang", "DA", "Lumbini"),
                new DistrictSeed("Banke", "BK", "Lumbini"),
                new DistrictSeed("Bardiya", "BD", "Lumbini"),
                new DistrictSeed("Surkhet", "SU", "Lumbini"),
                new DistrictSeed("Dailekh", "DL", "Lumbini"),
                new DistrictSeed("Jajarkot", "JJ", "Lumbini"),
                new DistrictSeed("Kalikot", "KL", "Lumbini"),
                new DistrictSeed("Salyan", "SL", "Lumbini"),
                new DistrictSeed("Jumla", "JU", "Karnali"),
                new DistrictSeed("Mugu", "MG", "Karnali"),
                new DistrictSeed("Humla", "HU", "Karnali"),
                new DistrictSeed("Darchula", "DC", "Karnali"),
                new DistrictSeed("Baitadi", "BI", "Karnali"),
                new DistrictSeed("Dadeldhura", "DD", "Karnali"),
                new DistrictSeed("Doti", "DT", "Karnali"),
                new DistrictSeed("Achham", "AC", "Karnali"),
                new DistrictSeed("Bajhang", "BH", "Karnali"),
                new DistrictSeed("Bajura", "BV", "Karnali"),
                new DistrictSeed("Kailali", "KA", "Sudurpashchim"),
                new DistrictSeed("Kanchanpur", "KC", "Sudurpashchim")
        );

        Map<String, District> districtMap = new HashMap<>();
        List<District> districts = new java.util.ArrayList<>();
        for (DistrictSeed ds : districtSeeds) {
            District district = new District();
            district.setProvinceId(provinceMap.get(ds.provinceName).getId());
            district.setName(ds.name);
            district.setCode(ds.code);
            districts.add(district);
        }
        districtRepository.saveAll(districts);
        for (District d : districts) {
            districtMap.put(d.getName(), d);
        }

        seedMunicipalities(districtMap);
    }

    private void seedMunicipalities(Map<String, District> districtMap) {
        List<MunicipalitySeed> seeds = List.of(
                new MunicipalitySeed("Kathmandu", "Metropolitan", "Kathmandu"),
                new MunicipalitySeed("Lalitpur", "Metropolitan", "Lalitpur"),
                new MunicipalitySeed("Bhaktapur", "Municipality", "Bhaktapur"),
                new MunicipalitySeed("Biratnagar", "Metropolitan", "Morang"),
                new MunicipalitySeed("Rajbiraj", "Municipality", "Saptari"),
                new MunicipalitySeed("Janakpur", "Municipality", "Dhanusha"),
                new MunicipalitySeed("Birgunj", "Municipality", "Bara"),
                new MunicipalitySeed("Pokhara", "Metropolitan", "Kaski"),
                new MunicipalitySeed("Biratpur", "Municipality", "Bara"),
                new MunicipalitySeed("Bhairahawa", "Municipality", "Rupandehi"),
                new MunicipalitySeed("Butwal", "Municipality", "Rupandehi"),
                new MunicipalitySeed("Hetauda", "Municipality", "Makwanpur"),
                new MunicipalitySeed("Bharatpur", "Municipality", "Chitwan"),
                new MunicipalitySeed("Dharan", "Municipality", "Sunsari"),
                new MunicipalitySeed("Dhangadhi", "Municipality", "Kailali"),
                new MunicipalitySeed("Mahendranagar", "Municipality", "Kanchanpur"),
                new MunicipalitySeed("Tikapur", "Municipality", "Kailali")
        );

        List<Municipality> municipalities = new java.util.ArrayList<>();
        for (MunicipalitySeed ms : seeds) {
            if (!districtMap.containsKey(ms.districtName)) continue;
            District district = districtMap.get(ms.districtName);
            Municipality muni = new Municipality();
            muni.setDistrictId(district.getId());
            muni.setName(ms.name);
            muni.setType(ms.type);
            muni.setCode(district.getCode() + "-" + ms.name.substring(0, Math.min(3, ms.name.length())).toUpperCase());
            municipalities.add(muni);
        }
        municipalityRepository.saveAll(municipalities);

        List<Ward> wards = new java.util.ArrayList<>();
        for (Municipality muni : municipalities) {
            int maxWards = muni.getType().equals("Metropolitan") ? 34 : 9;
            for (int i = 1; i <= maxWards; i++) {
                Ward ward = new Ward();
                ward.setMunicipalityId(muni.getId());
                ward.setNumber(i);
                wards.add(ward);
            }
        }
        wardRepository.saveAll(wards);
    }

    private Province createProvince(String name, String code) {
        Province p = new Province();
        p.setName(name);
        p.setCode(code);
        return p;
    }

    private PlatformModule module(ModuleCode code) {
        PlatformModule module = new PlatformModule();
        module.setCode(code);
        String name = moduleName(code);
        module.setName(name);
        module.setDescription(name + " module");
        module.setActive(true);
        return module;
    }

    private static String moduleName(ModuleCode code) {
        return MODULE_NAMES.getOrDefault(code, Arrays.stream(code.name().toLowerCase().split("_"))
                .map(part -> Character.toUpperCase(part.charAt(0)) + part.substring(1))
                .collect(java.util.stream.Collectors.joining(" ")));
    }

    private static class DistrictSeed {
        final String name;
        final String code;
        final String provinceName;

        DistrictSeed(String name, String code, String provinceName) {
            this.name = name;
            this.code = code;
            this.provinceName = provinceName;
        }
    }

    private static class MunicipalitySeed {
        final String name;
        final String type;
        final String districtName;

        MunicipalitySeed(String name, String type, String districtName) {
            this.name = name;
            this.type = type;
            this.districtName = districtName;
        }
    }
}
