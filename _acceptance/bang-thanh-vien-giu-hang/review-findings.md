## Trong hợp đồng

- **Hình dạng 4 (khẳng định âm tính đứng một mình, đo sai hộp): «tran ngang 0px» đo document, trong khi vùng cuộn của trang là main, nên không thấy tràn ngang bên trong main**
  file: `_acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs:157`
  severity: high
  AC: AC-3
  source: measurement
  detail: Dòng 157 tính `tranNgang: document.documentElement.scrollWidth - document.documentElement.clientWidth`, và dòng 313 khẳng định `d.tranNgang <= 0` cho AC-3 («ở cả ba khổ trang không tràn ngang»). Nhưng chính contract gọi `main[data-slot=page-shell-scroll]` là vùng cuộn của trang, và main ở page-shell.tsx dòng 32 là `overflow-y-auto`, nên overflow-x tính ra cũng là auto. Thứ gì rộng hơn main thì main tự cuộn ngang, còn `document.scrollWidth` không đổi. Vì vậy thước này chỉ bắt được phần tử thoát hẳn ra khỏi main (hai span sr-only ở lượt đỏ 98px), không bắt được tràn ngang bên trong main. Không có đối chứng dương nào cho thấy thước này đỏ được khi nội dung trong main rộng hơn main (chẳng hạn so `main.scrollWidth - main.clientWidth`). Bằng chứng ngay trong hồ sơ: `_acceptance/bang-thanh-vien-giu-hang/evidence/thanh-vien-375-noi.png` cho thấy bảng «Được phép vào» vẽ tay (`<table className="w-full">`, 6 cột, không có vỏ overflow) bị cắt ở mép phải khổ 375: nút «Phát…» mất một nửa. Vậy mà lượt đo vẫn in «DUNG 375x812: tran ngang 0px» và AC-3 được tính là đạt. Đây là một chiều xanh giả của đúng lời hứa AC-3.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (tuyên cả LỚP nhưng chỉ đo một điểm): AC-6 hứa «cách xếp lấp đầy của bảy trang không đổi» nhưng E6 chỉ đo trang Khoá API**
    Người dùng thấy gì: Sáu trang cài đặt khác dùng bảng lấp đầy (SSO, Liên hệ, Thoả thuận, Công ty, Chiến dịch, Danh mục onboarding) chưa được kiểm lại sau đợt sửa này, chỉ trang Khoá API đại diện được kiểm; rủi ro layout lệch ở các trang đó vẫn còn nhưng là giới hạn đã biết từ trước.
    file: `_acceptance/bang-thanh-vien-giu-hang/evals.yaml`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).