WITH tham_so AS (
  SELECT
    current_setting('okr.hoi_y') AS hoi_y,
    nullif(current_setting('okr.hoi_y_truoc', true), '') AS hoi_y_truoc
),
lan AS (
  SELECT h.id, h."nguoiChonUserId" AS nguoi_chon, h."congBoLuc" AS cong_bo_luc
  FROM "okrHoiY" h
  JOIN tham_so t ON t.hoi_y = h.id
),
thanh_vien AS (
  SELECT DISTINCT m."userId" AS user_id
  FROM "member" m
  CROSS JOIN lan l
  WHERE m."userId" <> l.nguoi_chon
),
gop AS (
  SELECT DISTINCT y."tacGiaUserId" AS user_id
  FROM "okrY" y
  JOIN lan l ON l.id = y."hoiYId"
  JOIN thanh_vien v ON v.user_id = y."tacGiaUserId"
),
hieu7 AS (
  SELECT DISTINCT u."userId" AS user_id
  FROM "okrHoiYHieu" u
  JOIN lan l ON l.id = u."hoiYId"
  JOIN gop g ON g.user_id = u."userId"
  WHERE l.cong_bo_luc IS NOT NULL
    AND u.luc >= l.cong_bo_luc
    AND u.luc < l.cong_bo_luc + interval '7 days'
),
ban AS (
  SELECT b.cau, b."boQua" AS bo_qua
  FROM "okrHoiYBanTruoc" b
  JOIN lan l ON l.id = b."hoiYId"
),
chu_de AS (
  SELECT c.id, c.loai, c."ketLuan" AS ket_luan, c."noiBanTruoc" AS noi, c."cauMucTieu" AS cau_muc_tieu
  FROM "okrChuDe" c
  JOIN lan l ON l.id = c."hoiYId"
),
cau_ban AS (
  SELECT c.chu, c.so
  FROM ban b
  CROSS JOIN LATERAL unnest(b.cau) WITH ORDINALITY AS c(chu, so)
  WHERE NOT b.bo_qua
),
cau_doi AS (
  SELECT k.so
  FROM cau_ban k
  WHERE EXISTS (
      SELECT 1 FROM chu_de d
      WHERE d.ket_luan = 'chon' AND d.noi = 'cau-' || k.so
    )
    AND NOT EXISTS (
      SELECT 1 FROM chu_de d
      WHERE d.ket_luan = 'chon'
        AND d.noi = 'cau-' || k.so
        AND lower(btrim(regexp_replace(d.cau_muc_tieu, '\s+', ' ', 'g')))
          = lower(btrim(regexp_replace(k.chu, '\s+', ' ', 'g')))
    )
),
gop_truoc AS (
  SELECT DISTINCT y."tacGiaUserId" AS user_id
  FROM "okrY" y
  JOIN tham_so t ON t.hoi_y_truoc = y."hoiYId"
  JOIN thanh_vien v ON v.user_id = y."tacGiaUserId"
),
y_lan AS (
  SELECT y.id, y."chuDeId" AS chu_de_id
  FROM "okrY" y
  JOIN lan l ON l.id = y."hoiYId"
)
SELECT
  (SELECT count(*)::int FROM thanh_vien) AS "thanhVien",
  (SELECT count(*)::int FROM gop) AS "gop",
  (SELECT count(*)::int FROM hieu7) AS "hieu7",
  (SELECT count(*)::int FROM cau_doi) AS "doi",
  (
    SELECT count(*)::int
    FROM chu_de d
    WHERE d.ket_luan = 'chon'
      AND (d.noi = 'moi' OR EXISTS (SELECT 1 FROM ban b WHERE b.bo_qua))
  ) AS "them",
  (SELECT count(*)::int FROM gop_truoc) AS "gopTruoc",
  (
    SELECT count(*)::int
    FROM gop_truoc p
    JOIN gop g ON g.user_id = p.user_id
  ) AS "gopLai",
  (SELECT count(*)::int FROM y_lan) AS "soY",
  (
    SELECT count(*)::int
    FROM y_lan y
    JOIN chu_de d ON d.id = y.chu_de_id
    WHERE d.loai = 'y-la'
  ) AS "soYLa",
  (SELECT count(*)::int FROM chu_de WHERE ket_luan = 'chon') AS "chuDeChon",
  (SELECT count(*)::int FROM chu_de WHERE ket_luan = 'de-sau') AS "chuDeDeSau",
  (SELECT count(*)::int FROM chu_de WHERE ket_luan = 'da-co') AS "chuDeDaCo",
  (SELECT count(*)::int FROM chu_de WHERE ket_luan = 'khong-lam') AS "chuDeKhongLam",
  (
    SELECT count(*)::int
    FROM "okrYDongY" d
    JOIN y_lan y ON y.id = d."yId"
  ) AS "soDongY";
