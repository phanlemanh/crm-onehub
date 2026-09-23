## Trong hợp đồng

Không có finding nào ánh xạ được vào AC trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **DOM runner stops at the first failing file, so failures in later files are never run or reported**
  Người dùng thấy gì: Khi nhiều tệp kiểm cùng lỗi trong một lần chạy, bạn chỉ thấy tên tệp lỗi đầu tiên; phải sửa xong tệp đó rồi chạy lại mới thấy lỗi tiếp theo.
  file: `packages/ui/test/chay-tung-tep-dom.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 3/4: phep «dau ra goi ten tep do» dat chi vi ten tep co mat trong dau ra, ma bo chay in ten do cho moi tep, ke ca tep xanh**
  Người dùng thấy gì: Phép kiểm tự động dùng để ký duyệt có thể coi là đạt ngay cả khi công cụ chỉ báo chung chung chứ không thật sự nêu đúng tệp bị lỗi, nên một lần ký duyệt có thể dựa trên bằng chứng chưa chắc phản ánh đúng thực tế.
  file: `_acceptance/moi-bai-kiem-dom-deu-chay/rang/dem-tep-dom.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hinh dang 5: ma tran tep lay tu dia bang dung cach loc cua ban cai dat, khong viet truoc; 16 tep va hai tep AC-1 goi ten khong duoc ghim**
  Người dùng thấy gì: Số lượng và tên các tệp kiểm được đối chiếu bằng chính cách công cụ tự liệt kê tệp của nó, nên nếu công cụ bỏ sót một tệp thì lần ký duyệt vẫn báo đủ mà không phát hiện ra.
  file: `_acceptance/moi-bai-kiem-dom-deu-chay/rang/dem-tep-dom.mjs`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).