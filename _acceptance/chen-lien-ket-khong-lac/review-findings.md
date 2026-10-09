# Review findings: chen-lien-ket-khong-lac (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **pha-chot xanh never emits the 'khoi Esc doi ngoai cach cho' diagnosis that evals.yaml E2 promises**
  Người dùng thấy gì: Khi ai đó sửa nhầm bài kiểm Esc ngoài phần cách chờ, bộ kiểm vẫn báo đỏ đúng, nhưng dòng giải thích nêu sai nguyên nhân (nói là tệp test cũ bị đổi). Người sửa có thể mất công đoán lỗi nằm ở đâu; người dùng sản phẩm không bị ảnh hưởng.
  file: `_acceptance/chen-lien-ket-khong-lac/rang/pha-chot.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

