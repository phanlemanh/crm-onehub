# Chấm bộ đo chịu câu lỗi — thiết kế

Hàng F34 của «OKR» (`docs/plan/lo-trinh-okr.json`): «E15 của tro-ly-doc-kho coi lượt đủ mã là đã đo, ghi câu lỗi
model vào cột riêng, có trần». Chủ kho ký Cổng Đáng `build` (19/10) và chốt ở phiên V3 ngày 30/10: «a, 5%».

## Vấn đề

`ketLuan` của `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts` trả mã 2 «KHONG DO DUOC» khi lượt có dù chỉ một câu
nhãn `loi`. Khoảng 2% lượt hỏi model lỗi ngẫu nhiên (đo 13/10: ba lượt liền, lượt nào cũng hai câu lỗi, rơi vào câu
khác nhau), nên bộ tạm khoảng 96 câu hầu như không bao giờ ra một lượt sạch: E15 đỏ sẵn trên `onehub`, mọi lượt ghim
lại `tro-ly-doc-kho` đỏ theo, và bản ghi đạt không bao giờ được ghi để dùng lại.

Luật «một câu lỗi là mã 2» không chỉ nằm trong mã. Nó là lời của bốn tiêu chí đã ký của F12
`eval-model-that-dung-luc` (AC-1, AC-6, AC-7, AC-12) và được ba thước của F12 đo: bài `nhan-loi`, bài `vung-xam`,
`rang/cham-lai.mjs`, cùng hai cặp đột biến a và e của `rang/dot-bien.mjs`. Đổi luật mà không đổi các chỗ đó thì F12
đỏ.

## Cách làm

1. **Trần.** Một hằng mới trong `CHAM_BO_DO`: `tranLoi: { phanTram: 5, toiThieu: 1 }`, và hàm
   `tranCauLoi(soCau) = max(toiThieu, floor(soCau × phanTram / 100))`. Số câu là mọi câu của lượt đang chấm, cả lượt
   kho lẫn lượt Zalo: bộ tạm 96 câu → trần 4; lượt hỏi lại 20 câu → trần 1. Phép nhân trên số nguyên phần trăm, không
   nhân số thực, để 60 × 0,05 không rơi xuống 2,999….
2. **Kết luận.** `ketLuan` đếm câu `loi` như cũ. Vượt trần → mã 2, dòng
   «KHONG DO DUOC: <n> cau loi vuot tran <t> (<id>, …)», không hỏi lại. Không vượt → chấm các chỉ số trên câu còn
   lại như cũ (câu `loi` vốn đã không vào tử hay mẫu số), mã 0 hay 1 theo ngưỡng, và thêm đúng một dòng
   «cau loi model: <n>/<N> (<id>, …) · tran <t> · dungTrang <a> · tuChoiDung <b> · chuyenQuyDinh <c> · chuyenNham <d>».
   Dòng có mặt cả khi n = 0 (khi đó không có ngoặc id): cột lỗi luôn đọc được, không đoán từ chỗ vắng.
3. **Đủ mã.** Một lượt đủ mã là đã đo. `kiemDuMa(dong, mong?)` trả câu lỗi khi tệp chấm từng câu có hai dòng cùng
   `(luot, id)`, hoặc — khi biết danh sách câu đã hỏi — thiếu một câu: «KHONG DO DUOC: trung ma <luot>:<id>» hay
   «KHONG DO DUOC: thieu ma <luot>:<id>», mã 2. Lượt đo đầy đủ truyền danh sách câu của lượt; `--cham-lai` chỉ biết
   tệp, nên chỉ bắt trùng.
4. **Ngưỡng không đổi.** Khối `NGUONG` của `cham-bo-do.ts` và `CHAM_BO_DO.nguong` giữ nguyên năm giá trị (E9 của F12).
5. **Bằng chứng.** Câu mô tả trong `cham-bo-do.md` nói thêm luật trần. Bảng từng câu giữ nhãn `loi` như cũ.
6. **F12 theo cùng luật.** Đổi lời AC-1, AC-6, AC-7, AC-12 của F12 từ «có câu loi» sang «câu loi vượt trần», sửa
   `expected` của các eval đo chúng, `rang/cham-lai.mjs` (ca 2 thành hai ca: một câu lỗi dưới trần, và đủ câu lỗi để
   vượt trần; round-trip đếm thêm dòng câu lỗi) và cặp đột biến e (dòng điều kiện đổi chữ). Một dòng sổ `fix` trong
   `_acceptance/eval-model-that-dung-luc/decisions.jsonl` mang `decided_by: Phan Le Manh`.
7. **Ghim lại** `tro-ly-doc-kho` và `eval-model-that-dung-luc` là bước cuối của vòng, sau Cổng Bằng chứng: PR chạm
   thư mục hai hồ sơ đã ký, lưới trước-gộp đòi ghim. Ghim `tro-ly-doc-kho` trước: lượt E15 thật sinh thư mục lượt mới
   mà `cham-lai.mjs` và cặp h của F12 đọc.

## Không làm

- Không đổi `evals.yaml` hay hợp đồng của `tro-ly-doc-kho`: AC-15 không nói gì về câu lỗi, và E15 vẫn «mã 0 khi đạt
  ngưỡng, 1 khi không».
- Không đổi ngưỡng, bộ câu, cách hỏi, hay luật dùng lại bản ghi trong 7 ngày.
- Không thử lại câu lỗi trong cùng lượt: thêm lời gọi model, và che sự cố thật.
- Không sửa các hồ sơ khác dựa vào mã thoát của script chấm (`bo-cau-hoi-mau`, `zalo-hoi-okr-khong-chet`,
  `sua-sau-chay-that`): chúng đã nhận cả ba mã, chỉ được đo lại để chắc vẫn xanh.

## Bậc thiết kế

Không chạm giao diện: không đặc tả UX, không design-pass, không eval `ui-check`.
