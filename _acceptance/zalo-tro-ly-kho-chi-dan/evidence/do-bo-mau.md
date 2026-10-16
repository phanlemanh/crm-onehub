# Đo trợ lý kho trên bộ câu hỏi mẫu

bam bo-mau: 0b3f3f96ddddb749f0a1d78b43f4cdbe88af8648e6fae42722c9fb66b0e02ac2
bam tro-ly: 44c3670837df2c11b809db9628fd6fa2284a84d78a8acf122f0f6ae5765612b6
ma thoat cham-bo-do: 2
thu muc luot cham-bo-do: .acceptance-runs/tro-ly-doc-kho/cham-bo-do/2026-10-16T06-38-48-633Z-14860
luot 1: 46 ma
luot 2: 50 ma

## Tổng của script chấm

- KHONG DO DUOC: 2 cau loi (m23, m43)
- demHoiKho cua cua so chay: traLoi 76, tuChoi 16, loi 0, tiLe 82.6%

## Bảng

### Lượt một theo tầng — đạt là trả lời đúng trang hay từ chối đúng

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 15 | 15 | 100.0% | 0 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 8 | 8 | 100.0% | 0 |
| S6-gan | 4 | 4 | 100.0% | 0 |
| S6-ngoai | 4 | 4 | 100.0% | 0 |
| S7 | 10 | 10 | 100.0% | 0 |

### Lượt một theo kiểu chữ

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| chuan | 36 | 36 | 100.0% | 0 |
| khong-dau | 2 | 2 | 100.0% | 0 |
| sai-chinh-ta | 2 | 2 | 100.0% | 0 |
| tin-zalo | 2 | 2 | 100.0% | 0 |
| tron-anh | 2 | 2 | 100.0% | 0 |
| viet-tat | 2 | 2 | 100.0% | 0 |

### Lượt hai qua Zalo theo tầng — đạt là chuyển đúng cho trợ lý kho, ngoài kho thì không chuyển

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 15 | 15 | 100.0% | 0 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 7 | 7 | 100.0% | 1 |
| S6-gan | 4 | 4 | 100.0% | 0 |
| S6-ngoai | 4 | 4 | 100.0% | 0 |
| S7 | 9 | 9 | 100.0% | 1 |
| ngoai-kho | 4 | 4 | 100.0% | 0 |

### Không đạt

- m23 (luot 2: loi)
- m43 (luot 2: loi)

<!-- bang-do -->
```json
{
  "tang": {
    "S1": {
      "k": 15,
      "n": 15,
      "loi": 0
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 8,
      "n": 8,
      "loi": 0
    },
    "S6-gan": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S6-ngoai": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S7": {
      "k": 10,
      "n": 10,
      "loi": 0
    }
  },
  "kieuChu": {
    "chuan": {
      "k": 36,
      "n": 36,
      "loi": 0
    },
    "khong-dau": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "viet-tat": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "sai-chinh-ta": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "tron-anh": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "tin-zalo": {
      "k": 2,
      "n": 2,
      "loi": 0
    }
  },
  "zalo": {
    "S1": {
      "k": 15,
      "n": 15,
      "loi": 0
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 7,
      "n": 7,
      "loi": 1
    },
    "S6-gan": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S6-ngoai": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S7": {
      "k": 9,
      "n": 9,
      "loi": 1
    },
    "ngoai-kho": {
      "k": 4,
      "n": 4,
      "loi": 0
    }
  },
  "khongDat": [
    "m23 (luot 2: loi)",
    "m43 (luot 2: loi)"
  ]
}
```
<!-- /bang-do -->
