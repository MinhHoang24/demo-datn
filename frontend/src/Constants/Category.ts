export const CATEGORY = {
  DIEN_THOAI: 'DienThoai',
  LAPTOP: 'Laptop',
  TAI_NGHE: 'TaiNghe',
  BAN_PHIM: 'BanPhim',
  CHUOT: 'Chuot',
  PHU_KIEN: 'PhuKien',
  TI_VI: 'TiVi',
  MAY_TINH_BANG: 'MayTinhBang',
} as const;

export const CATEGORY_LIST = Object.values(CATEGORY);

export const CATEGORY_TITLES = {
  [CATEGORY.DIEN_THOAI]: 'Điện Thoại',
  [CATEGORY.LAPTOP]: 'Laptop',
  [CATEGORY.TAI_NGHE]: 'Tai Nghe',
  [CATEGORY.BAN_PHIM]: 'Bàn Phím',
  [CATEGORY.CHUOT]: 'Chuột',
  [CATEGORY.PHU_KIEN]: 'Phụ Kiện',
  [CATEGORY.TI_VI]: 'Ti Vi',
  [CATEGORY.MAY_TINH_BANG]: 'Máy Tính Bảng',
};

export const CATEGORY_ROUTES = {
  [CATEGORY.DIEN_THOAI]: '/dienthoai',
  [CATEGORY.LAPTOP]: '/laptop',
  [CATEGORY.TAI_NGHE]: '/tainghe',
  [CATEGORY.BAN_PHIM]: '/banphim',
  [CATEGORY.CHUOT]: '/chuot',
  [CATEGORY.PHU_KIEN]: '/phukien',
  [CATEGORY.TI_VI]: '/tivi',
  [CATEGORY.MAY_TINH_BANG]: '/maytinhbang',
};
