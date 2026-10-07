export const CFG_PHAT_LICH = {
  nhanh_chinh: 'onehub',
  han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 },
  nhip_cu_phut: 10,
  suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 },
  bao_ve: [],
  s4_tran_gom_phut: 60,
  goc_kho: '/kho-thu',
};

export const CFG_BIEN = {
  nhanh_chinh: 'main',
  han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 },
  nhip_cu_phut: 10,
  suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 },
  bao_ve: ['packages/db/prisma/schema.prisma'],
  s4_tran_gom_phut: 60,
  goc_kho: '/kho-thu',
};

export const hangViecHai = ({ dot, w1, w2, link = false }) => ({
  dot,
  day: [
    { id: 'P1', worktree: w1, ...(link ? { link: 'claude://x/1' } : {}) },
    { id: 'P2', worktree: w2, ...(link ? { link: 'claude://x/2' } : {}) },
  ],
  hang: [
    { ma: 'A', slug: 'a', day: 'P1', moc: '2026-10-12', uu_tien: 1, ranh_gioi: ['apps/a/**'] },
    { ma: 'B', slug: 'b', day: 'P2', moc: '2026-10-14', uu_tien: 1, ranh_gioi: ['apps/b/**'] },
  ],
});
