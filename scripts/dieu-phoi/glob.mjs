export function khop(mau, duongDan) {
  let re = '';
  for (let i = 0; i < mau.length; i++) {
    const c = mau[i];
    if (c === '*') {
      if (mau[i + 1] === '*') {
        i++;
        if (mau[i + 1] === '/') {
          i++;
          re += '(?:.*/)?';
        } else {
          re += '.*';
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`).test(duongDan);
}

export const khopMot = (maus, duongDan) => maus.some((m) => khop(m, duongDan));
