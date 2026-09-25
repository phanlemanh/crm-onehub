# Phá-thử — tra-loi-tin-nhac

Mỗi dòng: eval · cách phá (trên cây đã commit, khôi phục bằng `git checkout`) · thông điệp đỏ đã thấy.

| Eval | Cách phá | Đỏ đã thấy |
| --- | --- | --- |
| E13 | `onboarding-ghi.ts` về bản `HEAD~1` (không gọi `datBuocXong`) | `setStepDone di qua datBuocXong` — 1 fail, 3 pass (commit `aebd9ac8`) |
| E4 | `zalo-lenh.ts` cho `SO` nhận `0` (`/^\d+$/`) | `o "xong 0"` — 1 fail (commit `b05d0320`) |
| E1 | `tin-nhac.ts` đánh số ngược (`daGui.length - indexOf`) | `dong 1 bat dau "1. "` (commit `db27d00a`) |
| E1 | `tin-nhac.ts` bỏ dòng gợi ý khỏi phép tính trần | ô `zalo-muoi-hai` KHÔNG đỏ (tên công ty dài ngẫu nhiên nên tin hiếm khi sát trần); thêm ô `tran sat` (commit `cdfadf88`) → `khong vuot tran khi tin sat tran` đỏ |
| E2 | `tra-loi-nhac.ts` lệch một (`muc[so]`) | `muc 2 la S` (commit `31cac00a`) |
| E2 | bỏ `source: "zalo"` khỏi dấu vết | `source zalo` |
| E3 | `docLenh` không nhận dấu phẩy | `o xong 1,3: muc 1` |
| E3 | bỏ gộp số trùng | E3 KHÔNG đỏ: mục đã xong từ trước không sinh dấu vết thứ hai, số dấu vết vẫn 2. Lỗi này do E4 bắt: `o "xong 3 1 3"` |
| E5 | bỏ kiểm số ngoài dải | `duoc ca hoac khong` |
| E6 | bỏ kiểm mục không phải bước | `o ke-hoach-im co APP_URL: muc khong phai buoc chan ca lenh` |
| E7 | đảo hai danh sách trong câu xác nhận | `3 vua xong, 2 da xong tu truoc` |
| E7 | bước mất bị bỏ qua | `o da-xoa: buoc mat chan ca lenh` |
| E7 | lùi cả `ZaloUpdateSeen` khi bước đổi | `o da-xoa: tin khong bi gui lai` |
| E8 | «hôm nay» theo ngày UTC | `(f) 00:01 ngay D+1: khong buoc nao doi` (đỏ ở (f), không ở (e): 23:59 giờ VN vẫn cùng ngày UTC) |
| E8 | lấy hàng nhắc mới nhất thay vì hôm nay | `(a) chi hom qua: khong buoc nao doi` |
| E9 | bỏ kiểm vai `okr` | `vai okr khong ghi` |
| E10 | «xong» thiếu số tính là mã sai | `xong khong tinh la ma sai` |
| E12 | ghi bước ngoài giao dịch | `loi DB khong de buoc nao doi` |
| E15 | ghi log nội dung tin | `khong dong log nao chua M` (cách phá khác bản khai: ghi log thay cho ghi vào meta, vì «xong 1 M» không phải lệnh nên không tới được meta) |
| E16 | `nguong.ts` đếm cả tin Slack vào mẫu số | `mau so chi tin Zalo` (commit `d289d1fa`) |
| E14 | bản sao (`GOC_KHO`) thêm `lib/hong.ts` import `../../../api/src/x` | `import tu apps/api: apps/agent/agent/lib/hong.ts -> ../../../api/src/x`, exit 1 |
| E17 | chạy trước khi sửa tài liệu | ba mốc KHÔNG ĐẠT (CONTEXT, docs/agent.md, lộ trình mục 7), exit 1 |
