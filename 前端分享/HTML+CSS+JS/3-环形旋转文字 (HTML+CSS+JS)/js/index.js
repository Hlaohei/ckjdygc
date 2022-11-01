// 获取文字的标签
const text = document.querySelector(".text");

// 把标签里面的内容进行切割，每个字符独立进行旋转，做成独立的 span 标签
const span = text.textContent.split("").map((item, i) => {
  // 返回切割好的文字标签
  return `
    <span style="transform:rotate(${i * 12.8}deg)">
      ${item}
    </span>
  `;
});

// 把所有 span 文字标签再全部塞回去
text.innerHTML = span.join("");
