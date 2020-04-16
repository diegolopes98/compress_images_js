const input = document.querySelector("input");
const preview = document.querySelector(".preview");
input.addEventListener("change", updateImageDisplay);

function validFileType(file) {
  const fileTypes = [
    "image/apng",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
    "image/x-icon",
  ];
  return fileTypes.includes(file.type);
}

function returnFileSize(number) {
  if (number < 1024) {
    return number + "bytes";
  } else if (number >= 1024 && number < 1048576) {
    return (number / 1024).toFixed(1) + "KB";
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + "MB";
  }
}

function updateImageDisplay() {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }

  const curFiles = input.files;
  if (curFiles.length === 0) {
    const para = document.createElement("p");
    para.textContent = "No files currently selected for upload";
    preview.appendChild(para);
  } else {
    const list = document.createElement("ol");
    preview.appendChild(list);
    for (const file of curFiles) {
      const listItem = document.createElement("li");
      if (validFileType(file)) {
        const loading = document.createElement("p");
        loading.innerHTML = "Loading...";
        loading.className = "loading";
        listItem.appendChild(loading);

        const reader = new FileReader();
        const maxWidth = 1024;
        const maxHeight = 1024;
        const fileName = file.name;
        const fileSize = file.size;
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          (img.onload = () => {
            const original = document.createElement("img");
            original.src = URL.createObjectURL(file);

            let ratio = 0;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              ratio = maxWidth / width;
              width = maxWidth;
              height = height * ratio;
            }

            if (height > maxHeight) {
              ratio = maxHeight / height;
              width = width * ratio;
              height = maxHeight;
            }

            const compressed = document.createElement("canvas");
            compressed.width = width;
            compressed.height = height;
            const ctx = compressed.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            ctx.canvas.toBlob(
              (blob) => {
                const file = new File([blob], fileName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });

                listItem.removeChild(listItem.querySelector(".loading"));

                const infoFileName = document.createElement("p");
                infoFileName.innerHTML = `File name: <strong>${fileName}</strong>`;
                listItem.appendChild(infoFileName);

                listItem.appendChild(original);
                const infoOriginalSize = document.createElement("p");
                infoOriginalSize.innerHTML = `Original file size: <strong>${returnFileSize(
                  fileSize
                )}</strong>`;
                listItem.appendChild(infoOriginalSize);

                listItem.appendChild(compressed);
                const infoCompressedSize = document.createElement("p");
                infoCompressedSize.innerHTML = `Compressed file size: <strong>${returnFileSize(
                  file.size
                )}</strong>`;
                listItem.appendChild(infoCompressedSize);
              },
              "image/jpeg",
              0.1
            );
          }),
            (reader.onerror = (error) => console.log(error));
        };
      } else {
        para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
        listItem.appendChild(para);
      }

      list.appendChild(listItem);
    }
  }
}
