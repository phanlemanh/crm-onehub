## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E10 hứa 5×2 khẳng định, nhưng tiêu đề trang không bao giờ được kiểm, nên chiều đỏ đã khai không thể bắn**
  AC: AC-9
  file: `apps/app/test/moi-kr-ca-cong-ty.dom.tsx:346`
  severity: high
  source: measurement
  detail: evals.yaml E10 hứa một ma trận 5 trạng thái × 2 khẳng định: có [data-trang-thai=ST-moikr-<tên>] VÀ PageShellTitle «Mọi KR» vẫn có mặt. Thêm vào đó là nút thử lại gọi refetch, và «Bỏ lọc» xoá cả ba tham số. Chiều đỏ đã khai là «bản sao đặt tiêu đề trong mã khách sau Suspense → đỏ, mất tiêu đề». Thực tế, test ở dòng 346-395 chỉ dựng <MoiKr /> (thành phần khách), không dựng page.tsx, và chỉ chờ data-trang-thai (dòng 377-382). Khẳng định duy nhất là expect(thay).toEqual(["cho","loi","chuachuky","rong","khongkhop"]) ở dòng 394, tức là 5 khẳng định chứ không phải 10. Không chỗ nào đọc PageShellTitle, và trạng thái lỗi không bấm thử lại. Ở ca khongkhop chỉ nguoiKr được đặt và kiểm (dòng 370, 390), nên lời hứa «xoá cả ba tham số» không được đo. Kết quả là bản đột biến chuyển tiêu đề vào mã khách vẫn để test xanh.
  lý do vào hợp đồng: AC-9 hứa rõ tiêu đề trang giữ ở mọi trạng thái ST-moikr-*; bài kiểm không đo tiêu đề nên lời hứa này không được chứng minh.

- **Hình dạng 5 (thiếu ma trận toàn phần viết trước): đối chứng «cùng vạch với KR của tôi» âm thầm bỏ đúng KR công bố muộn**
  AC: AC-2
  file: `apps/api/test/okr-moi-kr.spec.ts:304`
  severity: medium
  source: measurement
  detail: E3 (c) hứa so khớp «với MỖI KR của người u2» giữa {expected, tinhTrang} của okr.moiKr và {expected, nhip} của okr.khoiCuaToi. Dòng 304-315 dùng flatMap và chỉ giữ những KR mà khoiCuaToi có trả về; mọi KR khác bị bỏ qua mà không báo. Chốt chặn duy nhất là expect(doiChieu.length).toBeGreaterThan(0) ở dòng 316, không so với danh sách KR của u2 viết trước. Có hai lý do khiến KR muon-k1 rơi ra. Thứ nhất, khoiCuaToi cắt ở OKR_XEM.khoiCuaToi.toiDa = 5 (okr-xem.service.ts, `xep.slice(0, OKR_XEM.khoiCuaToi.toiDa)`). Thứ hai, trong bộ mẫu ca-moi-kr, u2 phụ trách 6 KR: b1-k1 (trượt), ca-nhan-k1 (trượt), p1-k2, p3-k1, ca-nhan-k2 (chậm nhịp) và muon-k1 (đúng nhịp, xếp cuối). Vì vậy muon-k1, đúng là KR của mục tiêu công bố muộn mà lời hứa «vạch đếm từ ngày công bố» nhắm tới, gần như chắc chắn bị cắt khỏi khoiCuaToi và không được so. Vế (b) chỉ kiểm tinhTrang, nên giá trị expected của KR công bố muộn không có khẳng định nào giữ.
  lý do vào hợp đồng: AC-2 hứa vạch kỳ vọng đếm từ ngày công bố cùng vạch với khối «KR của tôi» cho cùng KR; đối chứng bỏ im KR công bố muộn nên vế này không được giữ.

- **Hình dạng 5 (ma trận viết trước bị cắt bớt): E8 bỏ hẳn bước đổi chu kỳ mà AC-7 hứa**
  AC: AC-7
  file: `apps/app/test/moi-kr-ca-cong-ty.dom.tsx:221`
  severity: medium
  source: measurement
  detail: evals.yaml E8 liệt kê bốn bước: mở đường mang ba tham số, chọn thêm chip cham-nhip, đổi kỳ c2 sang c3 qua ChonChuKy và kiểm ba tham số lọc giữ nguyên, rồi mở đường có giá trị hỏng. AC-7 cũng hứa «đổi chu kỳ ở đầu thanh bên thì bộ lọc giữ nguyên». Test mkc-duong-dan ở dòng 221-249 chỉ có bước 1, 2 và 4. Không chỗ nào dựng ChonChuKy hay ThanhBenMucTieu để đổi kỳ rồi đọc lại tinhTrangKr, donViKr, nguoiKr trên url. Một bản sửa làm mất bộ lọc khi đổi chu kỳ (chẳng hạn một Link chu kỳ chỉ mang kyOkr) vẫn để test xanh.
  lý do vào hợp đồng: AC-7 nêu rõ «đổi chu kỳ ở đầu thanh bên thì bộ lọc giữ nguyên» mà bài kiểm không có bước nào đổi chu kỳ.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «tong-bang» của E2 đọc lại con số total do API trả, không đếm dòng bảng hiện ra**
  AC: AC-1
  file: `_acceptance/moi-kr-ca-cong-ty/rang/do-man.mjs:160`
  severity: medium
  source: measurement
  detail: AC-1 hứa: bấm ô thì «bảng chỉ gồm dòng Trượt, số dòng bằng số trên ô». docBang (dòng 160, 171) lấy `tong` từ [data-tong-kr]. Trong moi-kr.tsx, phần tử này hiện `{t.tong}: {ds.data.total}`, tức là con số total của okr.moiKr được in lại nguyên văn, không phải số dòng DataTable dựng ra. So sánh ở dòng 223-224 (soO !== soApi, tongBang !== soO) vì thế chỉ đối chiếu ba con số cùng rút từ okr.moiKr (facetCounts.truot và hai lần total). Bảng có bỏ hay nhân đôi dòng thì `tong` vẫn đúng; dòng 225 chỉ kiểm mỗi dòng đang hiện là Trượt, không kiểm số dòng. Pha-thử MKC_PHA=mot-trang ở dòng 217 (Math.min(bang.tong, 1)) sửa biến của chính bàn đo chứ không sửa sản phẩm. Nó chỉ chứng minh phép so sánh có chạy, không chứng minh bàn đo bắt được lệch giữa số dòng thật và số trên ô. Trong khi đó N_TRUOT = 3 nhỏ hơn cỡ trang, nên đếm thẳng bang.tieuDe.length là làm được.
  lý do vào hợp đồng: AC-1 hứa số dòng của bảng bằng số trên ô, nhưng bàn đo chỉ so ba con số cùng lấy từ API chứ không đếm dòng bảng thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ô «KR trượt» hiện 0 khi truy vấn okr.moiKr lỗi**
  Người dùng thấy gì: Khi tải số KR trượt bị lỗi (mất mạng, máy chủ lỗi), ô «KR trượt» ở Sức khoẻ vẫn hiện số 0. Người xem có thể tưởng không có KR nào trượt.
  Căn cứ: Số sai chỉ xuất hiện lúc tải lỗi và tự đúng lại khi tải lại trang; không mất dữ liệu, nhưng có thể làm lãnh đạo hiểu nhầm trong lúc đó.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/o-kr-truot.tsx`
  severity: medium
  Đề xuất: known-limits

- **Cách suy tình trạng KR (mốc xong/chưa, nhịp) bị chép thêm một bản thay vì dùng chung**
  Người dùng thấy gì: Hiện người dùng thấy tình trạng KR giống nhau ở mọi màn. Nhưng nếu sau này đổi ngưỡng mà sót một chỗ thì hai màn có thể báo tình trạng khác nhau cho cùng một KR.
  Căn cứ: Chưa gây hại gì cho người dùng hôm nay; rủi ro chỉ xuất hiện khi ai đó đổi luật sau này, và dọn gọn thuộc việc bảo trì riêng.
  file: `apps/api/src/okr/moi-kr.ts`
  severity: low
  Đề xuất: wont-fix

- **Bảng nhãn tình trạng chép lại bảng của PaceIndicator**
  Người dùng thấy gì: Nhãn tình trạng ở chip lọc hiện đúng. Nếu sau này đổi tên một nhãn ở một nơi mà quên nơi kia, chip lọc và chấm trạng thái có thể gọi cùng một tình trạng bằng hai tên khác nhau.
  Căn cứ: Không ảnh hưởng người dùng hôm nay và sửa lúc nào cũng được; chi phí sửa lớn hơn hậu quả hiện có.
  file: `apps/app/app/(app)/[slug]/okr/moi-kr/moi-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **Ô «KR trượt» hiện 0 khi truy vấn moiKr lỗi (lỗi bị nuốt thành số đẹp)**
  Người dùng thấy gì: Khi không tải được số KR trượt, ô vẫn hiện 0 và vẫn bấm sang trang danh sách, không có dấu hiệu lỗi hay nút thử lại. Người xem dễ hiểu là công ty không có KR nào trượt.
  Căn cứ: Chỉ sai trong lúc lỗi tải và tự hết khi tải lại; không mất dữ liệu, nhưng số 0 trông như kết quả thật nên dễ gây hiểu nhầm.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/o-kr-truot.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

