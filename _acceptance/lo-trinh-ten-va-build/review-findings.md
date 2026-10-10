# Review findings: lo-trinh-ten-va-build (round 1)

## Trong hợp đồng

- **dung-build.sh: the apps/agent check is always 0, so AC-3's 'no file under apps/agent/' clause can never fail**
  AC: AC-3
  file: `_acceptance/lo-trinh-ten-va-build/rang/dung-build.sh:25`
  severity: medium
  source: bugs
  detail: The script counts `f.filter(x=>x.includes("apps/agent/"))` on the raw `files` array of page.js.nft.json. Paths in .nft.json are relative to the nft file's directory, not the repo root (ban-dung.mjs from LT1 resolves them with path.resolve(path.dirname(NFT), f) for exactly this reason). In this worktree's real build, the nft for apps/app/.next/server/app/(app)/[slug]/lo-trinh lists LO-TRINH.html as '../../../../../../../../LO-TRINH.html', and no entry contains 'apps/'. A file under apps/agent comes out as path.relative(...) = '../../../../../../../agent/agent/x.ts' (checked with node). That string never contains 'apps/agent/', so AGENT is always 0 and the clause `[ "$AGENT" -gt 0 ]` never fires. E3/AC-3 is therefore enforced only by the SO <= 2000 cap; a build that pulls in a few hundred apps/agent files would still print 'tep apps/agent 0' and 'dung-build: DUNG'. Fix: resolve each entry against dirname(NFT) and compare it with $GOC/apps/agent/ (and do the same for the LO-TRINH.html check, against $GOC/LO-TRINH.html).
  rationale: AC-3 yêu cầu rõ nhũng «không mang tệp nào dưới apps/agent/»; phép đo của mệnh đề này không bao giờ bắt được vi phạm nên AC-3 không được bảo chứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The test pinning the literal 'LO-TRINH.html' only checks the fallback branch of duongMacDinh**
  Người dùng thấy gì: Nếu sau này ai gõ sai tên tệp lộ trình ở một trong hai chỗ, bài kiểm vẫn xanh và trang có thể lặng lẽ đọc từ chỗ dự phòng thay vì chỗ ưu tiên. Người dùng vẫn thấy trang lộ trình bình thường.
  file: `apps/app/test/lo-trinh-doc-tep.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo thứ người dùng thật không đọc): E4b và bài kiểm doc-tep đo hàm giải đường có đối số, còn trang gọi nhánh mặc định mới tách riêng**
  Người dùng thấy gì: Thứ tự tìm tệp lộ trình mà trang thật dùng chỉ được kiểm gián tiếp. Nếu có người đảo thứ tự đó, các phép đo hiện có vẫn xanh nhưng trang có thể đọc nhầm bản tệp ở gốc kho thay vì bản ở gốc app.
  file: `apps/app/lib/lo-trinh/doc-tep.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): test «next.config khong khai glob» chỉ kiểm chữ LO-TRINH.html vắng mặt**
  Người dùng thấy gì: Nếu ai đó khai lại một mẫu quét khác trong cấu hình dựng, bài kiểm này không bắt được, và việc dựng ứng dụng có thể lại vỡ trên máy có thư mục liên kết vòng. Phép dựng thật vẫn là chốt cuối bắt lỗi đó.
  file: `apps/app/test/lo-trinh-doc-tep.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
