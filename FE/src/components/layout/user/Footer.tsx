const Footer = () => {
  return (
    <div className="w-screen h-80 bottom-0 bg-[rgba(54,54,54,1)] flex flex-col items-center pt-8 gap-8">
      <img
        className="h-16"
        src="https://s3-alpha-sig.figma.com/img/7a66/0317/2db7863c7e6ba009724368c27ced875b?Expires=1742169600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=YiRNwVtHQpbm0o4dslvVv~2asb338man6fzg7NJvB2vGPp~pk3XL-5xuG20dY8NPgn21HcxKUYA~zgf6HjHDMnFDUcvswiPUgX7edN0~vWCmdp3dftPb3dmASinsOvyyOqDn4G99p8v6g-cxKIWh~5NGc9OIrflESmrV7aUs2H8HgKvIij7XPzy0Bw5uAQq5rnz6lK9iehwcCjP-IoGjw8OTWSZRhKQO16USKTUQKuC29k5bxbzUT0Bpg46ifuJ5nk4Qf~pjZYQBqiS4XcwMv9xrgWmJyJdJ-V1Vf8SLEI4ySF91SNUc9LT~9G3lCSyq2QTtS055gRDn5KIFFXCpMA__"
      ></img>
      <div className="text-center space-y-4">
        <p className="text-sm text-[rgba(177,178,178,1)] font-normal">
          Địa chỉ :
          <span className="hover:underline">
            số nhà 64, Tổ 6 Nhân Trạch, Phường Phú Lương, Quận Hà Động, Thành
            Phố Hà Nội, Việt Nam
          </span>
        </p>
        <p className="text-sm text-[rgba(177,178,178,1)] font-normal">
          Số điện thoại : <span className="hover:underline">0966661046</span>
        </p>
        <p className="text-sm text-[rgba(177,178,178,1)] font-normal">
          Email :
          <span className="hover:underline">tranngochieu2908@gmail.com</span>
        </p>
      </div>
      <p className="text-xs text-[rgba(177,178,178,1)] font-extralight mt-4">
        © 2024 dochoiquocte.com , All Rights Reserved
      </p>
    </div>
  );
};

export default Footer;
