import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts: District[];
}

interface AddressSelectProps {
  onAddressChange: (address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    specificAddress?: string;
  }) => void;
  defaultAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    specificAddress?: string;
  };
}

const AddressSelect = ({
  onAddressChange,
  defaultAddress,
}: AddressSelectProps) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [specificAddress, setSpecificAddress] = useState(
    defaultAddress?.specificAddress || ""
  );
  const [zipCode, setZipCode] = useState(defaultAddress?.zipCode || "");

  useEffect(() => {
    // Fetch provinces from API with districts
    const fetchProvinces = async () => {
      try {
        const response = await fetch(
          "https://provinces.open-api.vn/api/?depth=2"
        );
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    // Set default values if provided
    if (defaultAddress?.city && provinces.length > 0) {
      setSelectedProvince(defaultAddress.city);
      const province = provinces.find((p) => p.name === defaultAddress.city);
      if (province) {
        setDistricts(province.districts);
        if (defaultAddress.state) {
          setSelectedDistrict(defaultAddress.state);
        }
      }
    }
  }, [defaultAddress?.city, defaultAddress?.state, provinces]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    const province = provinces.find((p) => p.name === value);
    if (province) {
      setDistricts(province.districts);
      setSelectedDistrict(""); // Reset district when province changes
    }
    updateAddress(value, "", specificAddress, zipCode);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    updateAddress(selectedProvince, value, specificAddress, zipCode);
  };

  const handleSpecificAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSpecificAddress(e.target.value);
    updateAddress(selectedProvince, selectedDistrict, e.target.value, zipCode);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
    updateAddress(
      selectedProvince,
      selectedDistrict,
      specificAddress,
      e.target.value
    );
  };

  const updateAddress = (
    province: string,
    district: string,
    specificAddressValue: string,
    zipCodeValue: string
  ) => {
    onAddressChange({
      street: specificAddressValue,
      city: province,
      state: district,
      country: "Vietnam",
      zipCode: zipCodeValue,
      specificAddress: specificAddressValue,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="province">Tỉnh/Thành phố</Label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.name}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">Quận/Huyện</Label>
        <Select
          value={selectedDistrict}
          onValueChange={handleDistrictChange}
          disabled={!selectedProvince}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn Quận/Huyện" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.code} value={district.name}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificAddress">Địa chỉ cụ thể</Label>
        <Input
          id="specificAddress"
          placeholder="Số nhà, tên đường..."
          value={specificAddress}
          onChange={handleSpecificAddressChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">Mã bưu chính</Label>
        <Input
          id="zipCode"
          placeholder="Nhập mã bưu chính"
          value={zipCode}
          onChange={handleZipCodeChange}
        />
      </div>
    </div>
  );
};

export default AddressSelect;
