# Chiều đỏ của phép đo màn (do-man.mjs)

Chạy 10/10 trên cây `11c078d3c` với năm tệp giao diện tạm trả về bản `38f73fa3a` (onehub trước vòng này):
`ho-so-viec.tsx`, `trang-lo-trinh.tsx`, `bang-cot.tsx`, `o-trang-thai.tsx`, `detail-sheet.tsx`. Script:
scratchpad `chieu-do.sh` (kiểm cây sạch, checkout năm tệp, chạy qua `tien-de.mjs --chay`, trả lại bằng trap).

```
SAI ngan-1280: ngan viec khong co dai o chung (url ?vongDoi=tat-ca&viec=docs/plan/lo-trinh-kho-tai-lieu.json%23l1, ngan keo 0)
SAI ngan-375: ngan viec o 375 khong phai ngan keo (url ?vongDoi=tat-ca&viec=docs/plan/lo-trinh-kho-tai-lieu.json%23l1, ngan keo 0)
SAI cot-moc-375: o moc bi cat: 2026-10-01
DUNG cot-moc-1280: ty le cot Moc 0.160
SAI the-bang-cot: the bang cot can giua: docs/plan/lo-trinh-okr.json#7n (text-align center, cach mep 3.7px)
SAI da-bac: nut Da bac bat trong nhu tat
KET LUAN: 1 DUNG, 5 SAI — ma thoat 1
```

`cot-moc-1280` xanh ở cả hai chiều là đúng: vế đó canh để vòng này KHÔNG đổi tỉ lệ cột Mốc trên máy tính.

Chiều đỏ của E1 (`lo-trinh-khung.dom.tsx`) trên ngăn cũ: `error: ngan khong dung khung chi tiet chung: docs/plan/lo-trinh-okr.json#0`.
Chiều đỏ của E8 (`ke-hoach.mjs`) trước khi sửa kế hoạch: `SAI LT1 trong kế hoạch chưa ghi đã lên onehub`.
Chiều đỏ của E9 (`thiet-ke.sh`) với một dòng thêm vào `company-sheet.tsx`: `SAI cho goi cu cua khung chung bi sua`.
