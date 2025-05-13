const Footer = () => {
  return (
    <div className="w-screen h-80 bottom-0 bg-[rgba(54,54,54,1)] flex flex-col items-center pt-8 gap-8">
      <img className="h-16" src="../logo.png"></img>
      <div className="text-center space-y-4">
        <p className="text-sm text-[rgba(177,178,178,1)] font-normal">
          Địa chỉ :
          <span className="hover:underline">
            số nhà 64, Tổ 6 Nhân Trạch, Phường Phú Lương, Quận Hà Động, Thành
            Phố Hà Nội, Việt Nam
          </span>
        </p>
        <p className="text-sm text-[rgba(177,178,178,1)] font-normal">
          Số điện thoại : <span className="hover:underline">0392031915</span>
        </p>
        <p className="text-sm text-[rgba(177,178,178,1)] font-normal">
          Email :<span className="hover:underline">chaupt2823@gmail.com</span>
        </p>
      </div>
      <p className="text-xs text-[rgba(177,178,178,1)] font-extralight mt-4">
        © 2024 dochoiquocte.com , All Rights Reserved
      </p>
    </div>
  );
};

export default Footer;
