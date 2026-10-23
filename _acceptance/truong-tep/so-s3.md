# Sổ S3 — truong-tep

Lượt phá-thử của các phép đo mới (khuôn `MEASURE-BIRTH-CLAUSE`): mỗi đột biến làm trên cây làm việc, chạy đúng lệnh của
eval, rồi trả tệp về nguyên (so `diff` với bản chép trước khi phá).

| Eval | Đột biến | Lệnh | Kết quả |
|---|---|---|---|
| E8 vế a | `blob-tep-truong.ts` lùi về `KHO_TAI_LIEU_BLOB_TOKEN` khi khoá tệp vắng | `bun test test/blob-tep-truong.spec.ts -t ttp-khoa` | đỏ: `ttp khoa: bat tep-vang kho-co`; ca thiếu khoá treo 5 giây vì gọi thật tới `127.0.0.1:9` (dừng tay PID của lượt). Tệp đã về nguyên. |
| E8b | thêm một dòng trống cuối `blob-nguon.ts` trên worktree tạm, commit tạm | cặp hai chiều nằm trong `rang/bai-cu-nguyen.mjs` | đỏ đúng `ttp kho tai lieu: sua packages/db/src/blob-nguon.ts`; worktree tạm đã gỡ. |
| E9b | xoá `case "FILE"` của `coerceValue` trong bản chép | cặp hai chiều nằm trong `rang/quet-kieu.mjs` | đỏ đúng `ttp quet: switch thieu FILE packages/db/src/fields.ts:`. |
| E3 | `complete` nhận kiểu theo đuôi tên thay cho byte | `bun test test/truong-tep.spec.ts -t ttp-tu-choi` | đỏ: `ttp tu choi: rac duoi pdf nhan`. Tệp đã về nguyên. |
| E4 | `coTheMoTep` trả `true` cho mọi vai | `bun test test/truong-tep.spec.ts -t ttp-quyen` | đỏ: `ttp quyen: member downloadUrl url`. Tệp đã về nguyên. |
| E9 | gỡ chặn `FILE` ở đầu `coerceValue` và nhánh `case "FILE"` | `bun test test/truong-tep.spec.ts -t ttp-ghi-chu` | đỏ: `ttp ghi chu: deals.update abc nhan`. Tệp đã về nguyên. |
| E6 | `remove` xoá Blob trước, xoá hàng ngoài giao dịch, bỏ hàng chờ | `bun test test/truong-tep.spec.ts -t ttp-xoa` | đỏ: `ttp xoa: blob hong khong cho`. Tệp đã về nguyên. |
| E7 | `deals.purge` không ghi hàng chờ (`tepXoa = []`) | `bun test test/truong-tep.spec.ts -t ttp-vong-doi` | đỏ: `ttp vong doi: deals.purge xoa []`. Tệp đã về nguyên. |
| E1b | `KARA_DIEN_THEO_KIEU.FILE` thành `true` (`fields-shape.ts`) | `bun test ./test/truong-tep.dom.tsx -t ttp-cai-dat` | đỏ: `ttp cai dat: con Kara dien`. Tệp đã về nguyên. |
| E4b | nút «Mở» bỏ điều kiện `coTheMo` (`o-tep.tsx`) | `bun test ./test/truong-tep.dom.tsx -t ttp-o-tep` | đỏ: `ttp o tep: co tep khong-mo/xoa mo`. Tệp đã về nguyên. |
| E5b | bỏ lựa chọn «Có tệp» khỏi menu lọc (`field-facets.tsx`) | `bun test ./test/truong-tep.dom.tsx -t ttp-man-loc` | đỏ: `ttp man loc: thieu Có tệp`. Tệp đã về nguyên. |
| E2b | `access: "private"` thành `"public"` ở cả ba chỗ ký của `blob-tep-truong.ts` | lệnh `ttp_blob_that` (kho dev `crm-tep-ban-ghi-dev`) | **không đỏ — đột biến tương đương**: ba bài vẫn xanh, đường trần vẫn trả 403 từ `<store>.private.blob.vercel-storage.com`. Kho được tạo riêng tư (R3-1) nên tính riêng tư nằm ở kho, không ở tham số `access`. Vế (b) chỉ đỏ được khi khoá trỏ một kho công khai; máy không có kho như vậy và không tự tạo. Tệp đã về nguyên. |
| E2b phụ | `bun test` không in «0 skip» khi không bài nào bị bỏ | — | bài tự in `ttp-blob-that: <n> chay, <3-n> skip` ở `afterAll` trong khối `describe.skipIf`; khối bị bỏ thì không có dòng, nên «0 skip» chỉ xuất hiện khi cả ba bài đã chạy. |
| AC-10 (S4-r1 Ngoài hợp đồng t5) | `NguonKeoTha` không chuyển `multiple` vào `useFileUpload` (bản trước sửa) | `bun test ./test/nguon-keo-tha.dom.tsx` | đỏ: `nhieu: tha a.pdf` — thả hai tệp chỉ nhận tệp đầu. Sau sửa xanh 9/9. |
| E10 (S4-r1) | bỏ `<span className="min-w-0 truncate">` quanh tên tệp ở `o-tep.tsx` | lệnh `ttp_man` | đỏ: `ttp man: ten khong cat 1` — tên dài ở 375 xuống nhiều dòng. Tệp đã về nguyên, chạy lại: `ttp man: dat`. |
| Dọn dữ liệu (sau Cổng 2, F-128) | bỏ lệnh xoá `agentTask` trong `donBanGhi` (`apps/api/test/truong-tep-san.ts`) | `bun test test/truong-tep.spec.ts` trên `crm_ttp_test` vừa đặt lại | đỏ: `ttp don: con 164 viec mo coi` — bài để lại 164 việc mở trỏ tới bản ghi đã xoá, làm `tro-ly-okr-giu-viec` (agent) đỏ khi chạy chung. Có lệnh xoá: 10/10 xanh, 0 việc mở. |
