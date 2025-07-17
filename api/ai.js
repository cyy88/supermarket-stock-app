// AI图片识别服务
// 使用Coze工作流进行商品图片识别

/**
 * 调用Coze工作流进行图片识别
 * @param {string} imageUrl - 图片URL地址
 * @returns {Promise<Object>} 识别结果 {name: string, num: string}
 */
export const recognizeProductImage = async (imageUrl) => {
  try {
    console.log('开始AI识别，图片URL:', imageUrl);

    // 验证图片URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('图片URL不能为空')
    }

    // 使用uni.request调用Coze API，因为SDK在uni-app中可能不兼容
    const response = await new Promise((resolve, reject) => {
      console.log('发送AI识别请求...');

      uni.request({
        url: 'https://api.coze.cn/v1/workflow/run',
        method: 'POST',
        header: {
          'Authorization': 'Bearer cztei_hrUvbrDNQVXhIRv14xUtbZLkq9pPEKGXRjIHchvjHMQbhjpiuTh7lfEUbKo4dUMhU',
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
          console.log('AI识别响应:', res);
          resolve(res);
        },
        fail: (error) => {
          console.error('AI识别请求失败:', error);
          reject(error);
        }
      });
    });

    // 处理响应
    if (response.statusCode === 200) {
      const result = response.data;
      console.log('AI识别结果:', result);

      // 检查响应格式
      if (result.code === 0 && result.data) {
        try {
          // 对于非流式API，result.data可能直接是字符串或对象
          let outputData;

          if (typeof result.data === 'string') {
            // 如果是字符串，尝试解析
            const parsedData = JSON.parse(result.data);
            console.log('解析后的数据:', parsedData);

            if (parsedData.output) {
              outputData = parsedData.output;
            } else {
              outputData = result.data;
            }
          } else if (result.data.output) {
            // 如果是对象且有output字段
            outputData = result.data.output;
          } else {
            // 直接使用data
            outputData = result.data;
          }

          console.log('输出数据:', outputData);

          // 尝试不同的解析方式
          let name, num;

          if (typeof outputData === 'string') {
            // 如果是字符串，使用正则表达式提取
            const nameMatch = outputData.match(/["\']?name["\']?\s*:\s*["\']([^"']+)["\']?/i);
            const numMatch = outputData.match(/["\']?num["\']?\s*:\s*["\']([^"']+)["\']?/i);

            if (nameMatch && nameMatch[1]) name = nameMatch[1].trim();
            if (numMatch && numMatch[1]) num = numMatch[1].trim();
          } else if (typeof outputData === 'object') {
            // 如果是对象，直接获取属性
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
            console.log('识别成功:', resultData);
            return resultData;
          }

          throw new Error('识别结果格式不正确');
        } catch (parseError) {
          console.error('解析识别结果失败:', parseError);
          throw new Error('识别结果解析失败');
        }
      } else {
        throw new Error(result.msg || result.message || '识别失败');
      }
    } else {
      throw new Error(`请求失败，状态码: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('AI识别失败:', error);
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

  // 检查是否是有效的URL格式
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
