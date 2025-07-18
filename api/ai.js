/**
 * @param {string} imageUrl - 图片URL地址
 * @returns {Promise<Object>} 识别结果 {name: string, num: string}
 */
export const recognizeProductImage = async (imageUrl) => {
  try {

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('图片URL不能为空')
    }

    const response = await new Promise((resolve, reject) => {

      uni.request({
        url: 'https://api.coze.cn/v1/workflow/run',
        method: 'POST',
        header: {
          'Authorization': 'Bearer pat_P7Cdd5SkpcAZ89sIytH0oLZrpZhWzNcMZo7qBO1J1321O9puBkGezQXgDNJYKweM',
          'Content-Type': 'application/json'
        },
        data: {
          workflow_id: '7527607705478217763',
          parameters: {
            "input": imageUrl
          }
        },
        timeout: 30000, // 30秒超时
        success: (res) => {
          resolve(res);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });

    if (response.statusCode === 200) {
      const result = response.data;

      if (result.code === 0 && result.data) {
        try {
          let outputData;

          if (typeof result.data === 'string') {
            const parsedData = JSON.parse(result.data);

            if (parsedData.output) {
              outputData = parsedData.output;
            } else {
              outputData = result.data;
            }
          } else if (result.data.output) {
            outputData = result.data.output;
          } else {
            outputData = result.data;
          }

          let name, num;

          if (typeof outputData === 'string') {
            const nameMatch = outputData.match(/["\']?name["\']?\s*:\s*["\']([^"']+)["\']?/i);
            const numMatch = outputData.match(/["\']?num["\']?\s*:\s*["\']([^"']+)["\']?/i);

            if (nameMatch && nameMatch[1]) name = nameMatch[1].trim();
            if (numMatch && numMatch[1]) num = numMatch[1].trim();
          } else if (typeof outputData === 'object') {
            name = outputData.name;
            num = outputData.num;
          }

          if (name && num) {
            const resultData = {
              success: true,
              data: {
                name: name,
                num: num
              }
            };
            return resultData;
          }

          throw new Error('识别结果格式不正确');
        } catch (parseError) {
          throw new Error('识别结果解析失败');
        }
      } else {
        throw new Error(result.msg || result.message || '识别失败');
      }
    } else {
      throw new Error(`请求失败，状态码: ${response.statusCode}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || '识别失败，请重试'
    };
  }
}

/**
 * 验证图片URL是否有效
 * @param {string} url - 图片URL
 * @returns {boolean} 是否有效
 */
export const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 获取AI识别状态说明
 * @returns {Object} 状态说明
 */
export const getAIRecognitionInfo = () => {
  return {
    description: '使用AI智能识别商品图片中的商品名称和条形码',
    processingTime: '识别过程大约需要12秒',
    supportedFormats: ['JPG', 'PNG', 'JPEG'],
    tips: [
      '请确保图片清晰，商品信息可见',
      '建议图片中商品占据主要位置',
      '条形码需要清晰可读',
      '如识别结果不准确，可手动修改'
    ]
  }
}
