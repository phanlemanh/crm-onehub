## Trong hợp đồng

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): ô bản dựng không so giờ với múi giờ trình duyệt, kể cả ô New_York**
  AC: AC-7
  file: `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs:240`
  severity: medium
  source: measurement
  detail: E3b hứa với MỌI ô trong 8 ô: dòng giờ lấy bằng giờ của nguồn tính theo múi giờ của trình duyệt ở ô đó, và chỉ định riêng ô ban-dung-375-en chạy America/New_York (bảng O dòng 33 đúng là đặt NY). Nhưng oBanDung chỉ chấm `t.gio.includes(m.gioLay.banDung) && !t.coDau && t.cuon && t.khongDich`. Nó chỉ kiểm nhãn «(bản dựng)» có mặt, không tính chuỗi giờ kỳ vọng từ dungLuc bằng formatNgayGio với timeZone của ô như oBanChup làm ở dòng 276-286. Vì vậy với đường bản dựng, ô New_York không đo quan hệ giờ ↔ múi giờ. Nếu một bản sửa định dạng giờ bản dựng ở máy chủ (hoặc dùng sai giờ), cả 4 ô vẫn DUNG. AC-7 đòi cả ca rơi về bản dựng hiện giờ theo múi giờ trình duyệt; phép đo không chứng minh được quan hệ đó ở đường bản dựng.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): grep văn bản next.config.ts và turbo.json, không gọi banDungHienTai()**
  AC: AC-6
  file: `apps/app/test/lo-trinh-ban-chup.spec.ts:106`
  severity: medium
  source: measurement
  detail: Ca «next.config dong gio dung va turbo cho VERCEL_ENV di qua» khớp regex `/LO_TRINH_DUNG_LUC:\s*new Date\(\)\.toISOString\(\)/` trên mã nguồn next.config.ts và kiểm `globalPassThroughEnv` chứa VERCEL_ENV / VERCEL_GIT_COMMIT_SHA. Thứ thật sự đọc các khoá này là banDungHienTai() trong chon-nguon.ts (process.env.VERCEL_GIT_COMMIT_SHA, LO_TRINH_DUNG_LUC, VERCEL_ENV), nhưng không ca nào gọi nó với env đặt sẵn. Mọi ca chonNguon đều truyền BanDung viết tay qua banDung(). Nếu đọc nhầm tên biến (ví dụ VERCEL_GIT_COMMIT_REF) hay tráo sha/moiTruong trong banDungHienTai, cả ma trận 12 ô lẫn ca grep vẫn xanh. AC-6 dựa vào việc nhận đúng sha, giờ bắt đầu dựng và môi trường của bản đang chạy; phép đo không đi qua chỗ đọc các biến đó.

- **Hình dạng 3: sha/commitLuc được tiêm vào rồi assert chính giá trị tiêm, không đo quan hệ với HEAD của lượt chạy**
  AC: AC-1
  file: `scripts/ban-chup-lo-trinh/test/day.test.ts:93`
  severity: medium
  source: measurement
  detail: E2 hứa rằng sha trong thân gửi bằng sha của lượt chạy và commitLuc bằng `git log -1 --format=%cI` của HEAD. Test tự tính SHA/COMMIT_LUC (dòng 16-23), truyền vào day({ sha: SHA, commitLuc: COMMIT_LUC }) ở dòng 71-72, rồi assert `than.sha === SHA` và `than.commitLuc === COMMIT_LUC` (dòng 93-94). Đây chỉ là đo hàm có trả lại đúng tham số không. Phần thật sự suy ra sha và commitLuc (khối `import.meta.main` của day.ts, dòng 110-125: rev-parse, cwd, định dạng %cI) không bao giờ chạy trong test. Nếu khối đó dùng sai cờ hay sai thư mục thì test vẫn xanh. AC-1 đòi bản chụp mang đúng sha và giờ commit của lần gộp; phần suy ra hai giá trị này từ HEAD chưa được đo.

- **Hình dạng 2: Luot viết tay theo khuôn tinhDoTre, bỏ qua phần ghép gh→Luot; mẫu gh-run-view-jobs.json không ai đọc**
  AC: AC-9
  file: `scripts/ban-chup-lo-trinh/test/do-tre.test.ts:25`
  severity: medium
  source: measurement
  detail: luotMau chỉ lấy phần tử đầu của gh-run-list.json qua docLuotTuGh, rồi ghi đè mọi trường quyết định kết quả: headSha, conclusion, updatedAt, headCommitLuc, ketQua. Bản thân docLuotTuGh luôn đặt headCommitLuc "" và ketQua null. Hai trường đó chỉ được điền trong khối import.meta.main (git log theo headSha; gh run view --json jobs, rồi annotations của từng job), và khối này không có test nào chạm. Mẫu scripts/ban-chup-lo-trinh/test/mau/gh-run-view-jobs.json có trong diff nhưng không tệp nào đọc. Vậy các ca a–f đo tinhDoTre trên dữ liệu viết đúng khuôn bên đọc, không phải dữ liệu đi qua đường rút từ gh mà E17 tuyên bố. AC-9 là lệnh đo độ trễ ghép giờ commit với lượt Actions; phần ghép dữ liệu gh thành lượt chưa có test nào chạm.

- **Hình dạng 4 (âm tính một mình): «khoá Đẩy không mở được đường khác» chỉ kiểm status !== 200, không có đối chứng dương**
  AC: AC-2
  file: `apps/api/test/ban-chup-lo-trinh.spec.ts:229`
  severity: medium
  source: measurement
  detail: Cả ba đường (GET /api/trpc/workspace.get, POST /rest/tin-hieu/lich/keo-ve với thân "{}", GET /rest/api-keys) chỉ ghi sai khi `status === 200`. Lời gọi getSession thì bọc `.catch(() => null)`, nên mọi lỗi ném ra đều tính là «không mở phiên». Không có ca đối chứng gửi đúng các yêu cầu đó bằng một khoá hợp lệ cho đường ấy (khoá thường của chủ cho workspace.get và api-keys, khoá chỉ-kéo cho keo-ve) để chứng minh chúng có thể trả 200. Vì vậy 400 do thân/phương thức sai, 404 do sai đường hay 500 đều làm ca này xanh. Thông điệp có ghim, nhưng phép đo vẫn có thể rỗng. AC-2 đòi khoá Đẩy lộ trình không mở được thủ tục nào khác (tRPC, REST, phiên web); phép đo âm tính này có thể rỗng.

- **Hình dạng 3: h6 hứa đường khoá lo_trinh.0.hang.<i>.ma nhưng chỉ kiểm có một đoạn «ma»**
  AC: AC-3
  file: `apps/api/test/ban-chup-lo-trinh.spec.ts:352`
  severity: low
  source: measurement
  detail: E6 ghim h6 là "lo_trinh.0.hang.<i>.ma". Assert dùng `duongLoi.some((d) => d.split(".").includes(duong))` với duong = "ma", nên bất kỳ issue nào có một đoạn tên «ma» ở bất kỳ đâu cũng qua. h1/h2 cũng chỉ so một đoạn ("khuon", "lo_trinh") chứ không so cả đường. Ở tầng HTTP, quan hệ giữa chỗ phá và đường khoá trả về không được ghim. Bên validation spec có ghim đầy đủ, nhưng E1/E6 tuyên bố qua cầu REST thật. AC-3 đòi bản chụp hỏng bị từ chối với lời nói đúng chỗ hỏng; qua cầu REST chỗ hỏng chưa được ghim đầy đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trần thân 2 MB áp cho toàn bộ cầu REST, không riêng đường đẩy bản chụp**
  Người dùng thấy gì: Máy chủ nay nhận yêu cầu lớn tới 2 MB ở mọi đường REST, kể cả từ người chưa đăng nhập, thay vì 100 KB như trước. Kẻ xấu có thể gửi nhiều yêu cầu nặng để làm máy chủ chậm hơn.
  file: `apps/api/src/create-app.ts`
  severity: medium
  Đề xuất: known-limits

- **Mã nguồn «crm» khai hai nơi: bên ghi và bên đọc lấy từ hai hằng khác nhau**
  Người dùng thấy gì: Nếu sau này ai đổi tên nguồn ở một nơi mà quên nơi kia, trang Lộ trình sẽ lặng lẽ hiện bản dựng cũ thay vì bản mới nhất, và không có cảnh báo nào báo cho người quản lý biết.
  file: `apps/app/lib/lo-trinh/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Phản hồi JSON của GitHub được ép kiểu thẳng, không phân tích ở biên**
  Người dùng thấy gì: Khi GitHub hoặc lớp bảo vệ trả về nội dung bất thường, công cụ đẩy lộ trình và công cụ đo độ trễ có thể dừng với thông báo lỗi khó hiểu thay vì câu giải thích rõ ràng, khiến chủ kho khó biết vì sao lượt đẩy hay phép đo không có kết quả.
  file: `scripts/ban-chup-lo-trinh/do-tre.ts`
  severity: low
  Đề xuất: known-limits

- **Running the workflow by hand from any branch pushes that branch's roadmap to production, and later pushes from onehub are then dropped while the run still shows green**
  Người dùng thấy gì: Nếu chủ kho bấm chạy tay từ một nhánh chưa gộp, trang Lộ trình có thể hiện lộ trình chưa được duyệt và bỏ qua các lần cập nhật đúng sau đó cho tới khi nhánh chính có commit mới hơn, trong khi lượt chạy vẫn báo xanh.
  file: `.github/workflows/ban-chup-lo-trinh.yml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
