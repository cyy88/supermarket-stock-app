export const formatTime = (timestamp) => {
  if (!timestamp) return '未知'
  
  let date
  
  try {
    if (typeof timestamp === 'string') {
      const timeStr = timestamp.replace(' ', 'T')
      date = new Date(timeStr)
      
      if (isNaN(date.getTime())) {
        const parts = timestamp.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
        if (parts) {
          date = new Date(
            parseInt(parts[1]), // year
            parseInt(parts[2]) - 1, // month (0-based)
            parseInt(parts[3]), // day
            parseInt(parts[4]), // hour
            parseInt(parts[5]), // minute
            parseInt(parts[6])  // second
          )
        }
      }
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return '未知'
    }
    
    if (isNaN(date.getTime())) {
      return '未知'
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
    
  } catch (error) {
    return '未知'
  }
}

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '未知'
  
  try {
    let date
    if (typeof timestamp === 'string') {
      const timeStr = timestamp.replace(' ', 'T')
      date = new Date(timeStr)
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return '未知'
    }
    
    if (isNaN(date.getTime())) {
      return '未知'
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前'
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前'
    } else if (diff < 2592000000) { // 30天内
      return Math.floor(diff / 86400000) + '天前'
    } else {
      return formatTime(timestamp)
    }
  } catch (error) {
    return '未知'
  }
}

export const formatDate = (timestamp) => {
  if (!timestamp) return '未知'
  
  try {
    let date
    if (typeof timestamp === 'string') {
      const timeStr = timestamp.replace(' ', 'T')
      date = new Date(timeStr)
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return '未知'
    }
    
    if (isNaN(date.getTime())) {
      return '未知'
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
    
  } catch (error) {
    return '未知'
  }
}
