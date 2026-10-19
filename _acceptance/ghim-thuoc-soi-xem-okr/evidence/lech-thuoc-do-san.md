# Lệch của hai thước đỏ sẵn khi thêm bước «OKR read rule» (số đã che, nền d086bf8cf0943fc09dc5ad1ad4e7d5ef18a3537b)

## gpa_hinh
```diff
7c7
< KHONG BAT dieu-phoi-bo-if: mong «sai b: buoc test:dieu-phoi thieu if !cancelled()», duoc [sai a: jobs la [agent-okr-nodeN, build, luat-kho, phan-loai], mong [agent-okr-nodeN, build, luat-kho]; sai b: job luat-kho co N buoc, mong N; sai b: buoc N khong phai test:dieu-phoi; sai b: buoc N khong phai product map; sai b: buoc N khong phai pre-merge; sai c: agent-okr-nodeN thieu if pull_request; sai c: build co if]
---
> KHONG BAT dieu-phoi-bo-if: mong «sai b: buoc test:dieu-phoi thieu if !cancelled()», duoc [sai a: jobs la [agent-okr-nodeN, build, luat-kho, phan-loai], mong [agent-okr-nodeN, build, luat-kho]; sai b: buoc N khong phai test:dieu-phoi; sai b: buoc N khong phai product map; sai b: buoc N khong phai pre-merge; sai c: agent-okr-nodeN thieu if pull_request; sai c: build co if]
13d12
< sai b: job luat-kho co N buoc, mong N
```

## gpct_luong
```diff
4,7c4,7
< BAT bo-ready-for-review — push onehub mat lenh: bun run test:dieu-phoi; push release mat lenh: bun run test:dieu-phoi; PR synchronize mat lenh: bun run test:dieu-phoi
< BAT build-bo-cancelled — push onehub mat lenh: bun run build; push onehub mat lenh: bun run test:dieu-phoi; push release mat lenh: bun run build
< BAT build-if-bang-true — push onehub mat lenh: bun run build; push onehub mat lenh: bun run test:dieu-phoi; push release mat lenh: bun run build
< BAT check-thua-lenh — push onehub mat lenh: bun run test:dieu-phoi; push release mat lenh: bun run test:dieu-phoi; push release thua lenh: echo la
---
> BAT bo-ready-for-review — push onehub mat lenh: bun run test:dieu-phoi; push onehub thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem; push release mat lenh: bun run test:dieu-phoi
> BAT build-bo-cancelled — push onehub mat lenh: bun run build; push onehub mat lenh: bun run test:dieu-phoi; push onehub thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> BAT build-if-bang-true — push onehub mat lenh: bun run build; push onehub mat lenh: bun run test:dieu-phoi; push onehub thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> BAT check-thua-lenh — push onehub mat lenh: bun run test:dieu-phoi; push onehub thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem; push release mat lenh: bun run test:dieu-phoi
16,22c16,22
< sai PR chi TN: N lenh kiem: PR chi TN mat lenh: bun run test:dieu-phoi
< sai PR nhap: N lenh kiem: PR nhap mat lenh: bun run test:dieu-phoi
< sai PR phan-loai hong: N lenh kiem: PR phan-loai hong mat lenh: bun run test:dieu-phoi
< sai PR synchronize: N lenh kiem: PR synchronize mat lenh: bun run test:dieu-phoi
< sai push onehub: N lenh kiem: push onehub mat lenh: bun run test:dieu-phoi
< sai push release: N lenh kiem: push release mat lenh: bun run test:dieu-phoi
< sai ready_for_review: N lenh kiem: ready_for_review mat lenh: bun run test:dieu-phoi
---
> sai PR chi TN: N lenh kiem: PR chi TN mat lenh: bun run test:dieu-phoi; PR chi TN thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> sai PR nhap: N lenh kiem: PR nhap mat lenh: bun run test:dieu-phoi; PR nhap thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> sai PR phan-loai hong: N lenh kiem: PR phan-loai hong mat lenh: bun run test:dieu-phoi; PR phan-loai hong thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> sai PR synchronize: N lenh kiem: PR synchronize mat lenh: bun run test:dieu-phoi; PR synchronize thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> sai push onehub: N lenh kiem: push onehub mat lenh: bun run test:dieu-phoi; push onehub thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> sai push release: N lenh kiem: push release mat lenh: bun run test:dieu-phoi; push release thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
> sai ready_for_review: N lenh kiem: ready_for_review mat lenh: bun run test:dieu-phoi; ready_for_review thua lenh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
```
