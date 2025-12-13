import { CATEGORY } from './Category.ts';

import { IoPhonePortraitOutline } from "react-icons/io5";
import { FaLaptop, FaKeyboard, FaMouse, FaTools } from "react-icons/fa";
import { CiHeadphones } from "react-icons/ci";
import { PiTelevision } from "react-icons/pi";

export const MENU_ITEMS = [
  {
    category: CATEGORY.DIEN_THOAI,
    icon: IoPhonePortraitOutline,
  },
  {
    category: CATEGORY.LAPTOP,
    icon: FaLaptop,
  },
  {
    category: CATEGORY.TAI_NGHE,
    icon: CiHeadphones,
  },
  {
    category: CATEGORY.BAN_PHIM,
    icon: FaKeyboard,
  },
  {
    category: CATEGORY.PHU_KIEN,
    icon: FaTools,
  },
  {
    category: CATEGORY.CHUOT,
    icon: FaMouse,
  },
  {
    category: CATEGORY.TI_VI,
    icon: PiTelevision,
  },
  {
    category: CATEGORY.MAY_TINH_BANG,
    icon: PiTelevision,
  },
] as const;