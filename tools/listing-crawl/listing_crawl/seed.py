def sample_across(urls: list[str], limit: int | None) -> list[str]:
    if limit is not None and limit <= 0:
        raise ValueError("trần phải lớn hơn 0")
    if limit is None or len(urls) <= limit:
        return list(urls)
    step = len(urls) / limit
    return [urls[int(index * step)] for index in range(limit)]
