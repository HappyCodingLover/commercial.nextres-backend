export function removeCommaN(val: any): number {
  try {
    val = val.toString()
    let sign = val[0]
    let rlt: any = ''
    for (let i = 0; i < val.length; i += 1) {
      if (val[i] >= '0' && val[i] <= '9') rlt += val[i]
      if (val[i] === '.') rlt += val[i]
    }
    rlt = Number(rlt)
    if (sign === '-') rlt *= -1
    return rlt
  } catch {
    return 0
  }
}
