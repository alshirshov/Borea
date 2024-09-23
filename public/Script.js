const svgOptions = [];

async function populateSVGSelector() {
  try {
    const response = await fetch("/api/get-svg-list");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const svgFiles = await response.json();
    const selector = document.querySelector(".selector");
    svgFiles.forEach((file) => {
      const optElement = document.createElement("option");
      optElement.value = file.slice(0, -4); // Remove the '.svg' extension
      optElement.textContent = file
        .slice(0, -4)
        .replace(/_/g, " ")
        .replace(/-/g, " "); // Format the filename nicely
      selector.appendChild(optElement);
    });
  } catch (error) {
    console.error("Failed to fetch SVG list:", error);
  }
}

async function updateSVGDisplay(selectedShape) {
  if (!selectedShape) {
    document.querySelector(".svg-display").innerHTML = "Please select a shape";
    toggleButtons();  // Ensure buttons are updated based on shape selection
    toggleColorPickers();  // Ensure color pickers are updated based on shape selection
    return;
  }
  try {
    const response = await fetch(`/api/get-svg/${selectedShape}.svg`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const svgContent = await response.text();
    document.querySelector(".svg-display").innerHTML = svgContent;
    updateColorPickersFromSVG();
  } catch (error) {
    console.error("Failed to fetch SVG:", error);
    document.querySelector(".svg-display").innerHTML = "Error loading SVG";
  }
}

function updateColorPickersFromSVG() {
  const svgElement = document.querySelector('.svg-display svg');
  if (!svgElement) return;

  const editableClasses = ['editable', 'editable2', 'editable3'];
  editableClasses.forEach((className, index) => {
    const element = svgElement.querySelector(`.${className}`);
    if (element) {
      const color = element.getAttribute('fill');
      const colorPicker = document.getElementById(`colorPicker${index + 1}`);
      if (colorPicker) {
        colorPicker.value = color;
      }
    }
  });
}

function updateSVGColor(targetClass, color) {
  const elements = document.querySelectorAll(`svg .${targetClass}`);
  elements.forEach(element => {
    element.style.fill = color;
  });
}

function toggleCustomColorPickers(selectedValue) {
  const customColorPickersBlock = document.querySelector('.custom-color-pickers-block');
  
  if (selectedValue === 'custom') {
    customColorPickersBlock.classList.remove('hidden'); // Show custom color pickers
  } else {
    customColorPickersBlock.classList.add('hidden'); // Hide custom color pickers
    applyPresetColors(selectedValue); // Apply preset colors if another preset is selected
  }
}

function applyPresetColors(preset) {
  let color1, color2, color3;

  switch (preset) {
    case 'preset1':
      color1 = '#ff5733'; // Example color for preset 1
      color2 = '#33ff57';
      color3 = '#3357ff';
      break;
    case 'preset2':
      color1 = '#ffcc00'; // Example color for preset 2
      color2 = '#cc00ff';
      color3 = '#00ccff';
      break;
    default:
      return; // Exit if no preset is selected
  }

  updateSVGColor('editable', color1);
  updateSVGColor('editable2', color2);
  updateSVGColor('editable3', color3);
}

async function saveAsPDF() {
  const svgElement = document.querySelector(".svg-display");
  if (!svgElement) {
    alert("Please select an SVG to save.");
    return;
  }
  const scaleFactor = 3;
  const canvas = await html2canvas(svgElement, {
    scale: scaleFactor,
    backgroundColor: '#ffffff',
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.8);
  const pdfWidth = canvas.width / scaleFactor;
  const pdfHeight = canvas.height / scaleFactor;
  const pdf = new jspdf.jsPDF({
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    unit: "px",
    format: [pdfWidth, pdfHeight],
  });
  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("download.pdf");
}

function toggleButtons() {
  const shapeSelector = document.getElementById('shapeSelector');
  const saveButton = document.getElementById('saveButton');
  const orderButton = document.getElementById('orderButton');
  if (shapeSelector.value) {
    saveButton.style.display = 'inline-block';
    orderButton.style.display = 'inline-block';
  } else {
    saveButton.style.display = 'none';
    orderButton.style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateSVGSelector();
  toggleButtons();
  toggleColorPickers();  // Ensure color pickers are hidden by default on page load

  // Add event listener for the preset dropdown
  const colorPresetSelector = document.getElementById('colorPresetSelector');
  colorPresetSelector.addEventListener('change', (event) => {
    toggleCustomColorPickers(event.target.value);
  });
});
