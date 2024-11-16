const svgOptions = [];

// Populate the SVG dropdown with available SVGs
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

// Show or hide the background color picker based on shape selection
function toggleBackgroundColorPicker(show) {
  const backgroundColorPickerBlock = document.querySelector('.background-color-picker-block');
  if (show) {
    backgroundColorPickerBlock.classList.remove('hidden'); // Show background color picker
  } else {
    backgroundColorPickerBlock.classList.add('hidden'); // Hide background color picker
  }
}

// Update the background color of the SVG display
function updateBackgroundColor(color) {
  const svgDisplay = document.querySelector('.svg-display svg');
  if (svgDisplay) {
    svgDisplay.style.backgroundColor = color;  // Set the background color of the SVG
  }
}

// Update the SVG display with the selected shape
async function updateSVGDisplay(selectedShape) {
  if (!selectedShape) {
    document.querySelector(".svg-display").innerHTML = "Please select a shape";
    toggleButtons();  
    toggleColorPickers();  
    toggleColorPresets(false); 
    toggleBackgroundColorPicker(false); // Hide background color picker when no shape is selected
    return;
  }
  try {
    const response = await fetch(`/api/get-svg/${selectedShape}.svg`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const svgContent = await response.text();
    const svgDisplay = document.querySelector(".svg-display");

    svgDisplay.innerHTML = svgContent;
    const svgElement = svgDisplay.querySelector("svg");

    updateColorPickersFromSVG();
    toggleColorPresets(true); // Show color presets dropdown
    toggleBackgroundColorPicker(true); // Show background color picker when shape is selected
    toggleCustomColorPickersBasedOnSVG(svgElement); // Ensure color pickers are shown based on the SVG

    // Set default background color and border-radius
    updateBackgroundColor("#ADD8E6"); // Light blue default color
    svgElement.style.borderRadius = "20px"; // Set border radius

  } catch (error) {
    console.error("Failed to fetch SVG:", error);
    document.querySelector(".svg-display").innerHTML = "Error loading SVG";
    toggleColorPresets(false); 
    toggleBackgroundColorPicker(false); // Hide background color picker if error occurs
  }
}

// Update color pickers with the current SVG colors
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

  // Show or hide custom color pickers based on the number of editable classes
  toggleCustomColorPickersBasedOnSVG(svgElement);
}

// Fetch color presets from the database and populate the dropdown
async function populateColorPresets() {
  try {
    const response = await fetch('/api/get-color-presets');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const presets = await response.json();
    const presetSelector = document.getElementById('colorPresetSelector');

    // Clear existing options
    presetSelector.innerHTML = '<option value="default" selected>Please select a preset</option>';

    // Populate dropdown with presets from the database
    presets.forEach((preset) => {
      const optElement = document.createElement('option');
      optElement.value = preset.preset_name; // Use the preset name as the value
      optElement.textContent = preset.preset_name;
      presetSelector.appendChild(optElement);
    });

    // Add the "Custom Colors" option as the last option
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom Colors';
    presetSelector.appendChild(customOption);
  } catch (error) {
    console.error('Failed to fetch color presets:', error);
  }
}

// Apply the selected color preset to the SVG
function applyPresetColors(preset) {
  fetch(`/api/get-color-presets`)
    .then(response => response.json())
    .then(presets => {
      const selectedPreset = presets.find(p => p.preset_name === preset);
      if (selectedPreset) {
        // Update the SVG colors based on the selected preset
        updateSVGColor('editable', selectedPreset.color1);
        updateSVGColor('editable2', selectedPreset.color2);
        updateSVGColor('editable3', selectedPreset.color3);
      }
    })
    .catch(err => console.error("Error fetching preset colors:", err));
}

// Update SVG color
function updateSVGColor(targetClass, color) {
  const elements = document.querySelectorAll(`svg .${targetClass}`);
  elements.forEach(element => {
    element.style.fill = color;
    element.style.transition = 'fill 0.3s';  // Add transition for smoother color changes
  });
}

// Show or hide custom color pickers based on the selected preset
function toggleCustomColorPickers(selectedValue) {
  const customColorPickersBlock = document.querySelector('.custom-color-pickers-block');
  
  if (selectedValue === 'custom') {
    customColorPickersBlock.classList.remove('hidden'); // Show custom color pickers block
    const svgElement = document.querySelector('.svg-display svg');
    if (svgElement) {
      toggleCustomColorPickersBasedOnSVG(svgElement); // Ensure color pickers are shown based on the SVG
    }
  } else {
    customColorPickersBlock.classList.add('hidden'); // Hide custom color pickers
    applyPresetColors(selectedValue); // Apply preset colors if another preset is selected
  }
}

// Show or hide custom color pickers based on the number of editable classes in the SVG
function toggleCustomColorPickersBasedOnSVG(svgElement) {
  const editableClasses = ['editable', 'editable2', 'editable3'];

  editableClasses.forEach((className, index) => {
    const colorPickerWrapper = document.getElementById(`colorPicker${index + 1}`).parentElement;

    if (svgElement.querySelector(`.${className}`)) {
      colorPickerWrapper.classList.remove('hidden'); // Show the color picker if the class exists in the SVG
    } else {
      colorPickerWrapper.classList.add('hidden'); // Hide the color picker if the class does not exist
    }
  });
}

// Show or hide color presets dropdown based on shape selection
function toggleColorPresets(show) {
  const colorPresetsBlock = document.querySelector('.color-presets-block');
  if (show) {
    colorPresetsBlock.classList.remove('hidden');
  } else {
    colorPresetsBlock.classList.add('hidden');
  }
}

// Toggle visibility of color pickers
function toggleColorPickers() {
  const svgElement = document.querySelector('.svg-display svg');
  const colorPickers = document.querySelectorAll('.color-picker-wrapper');
  if (svgElement) {
    colorPickers.forEach(picker => picker.classList.remove('hidden'));
  } else {
    colorPickers.forEach(picker => picker.classList.add('hidden'));
  }
}

// Save the SVG as a PDF with required modifications
async function saveAsPDF() {
  try {
    const svgElement = document.querySelector(".svg-display svg");
    if (!svgElement) {
      alert("Please select an SVG to save.");
      return;
    }

    // Create a container for the PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'relative';
    pdfContainer.style.width = '210mm'; // A4 width
    pdfContainer.style.height = '297mm'; // A4 height
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.padding = '20mm'; // Add padding for better layout
    pdfContainer.style.display = 'flex';
    pdfContainer.style.flexDirection = 'column';
    pdfContainer.style.justifyContent = 'flex-start';
    pdfContainer.style.alignItems = 'flex-start'; // Align items to the left

    // Add header to the PDF
    const pdfHeader = document.createElement('div');
    pdfHeader.style.fontSize = '1.5rem'; // Adjust font size to 50% smaller
    pdfHeader.style.fontWeight = 'bold';
    pdfHeader.style.marginBottom = '5mm'; // Add more space between header and text
    pdfHeader.style.color = '#333333';
    pdfHeader.style.textAlign = 'left'; // Ensure text is aligned to the left
    pdfHeader.textContent = 'Borea Paper Works';
    pdfContainer.appendChild(pdfHeader);

    // Add instructional text below the header
    const instructions = document.createElement('div');
    instructions.style.fontSize = '1rem'; // Reduce text size by 50%
    instructions.style.marginBottom = '5mm'; // Increase bottom margin for iPhone
    instructions.style.textAlign = 'left'; // Ensure text is aligned to the left
    instructions.style.width = '100%';
    instructions.style.color = '#333333';
    instructions.innerHTML = 'Congratulations! Now you have a great starting point to produce your own print.<br>We suggest the following steps:<br><i>1. Cut out the shapes using sharp scissors<br>2. Apply some glue on the backside of one of the images and put the images together<br>3. Wait for the glue to be completely dry</i><br>';
    pdfContainer.appendChild(instructions);

    // "Front side" label
    const frontSideLabel = document.createElement('div');
    frontSideLabel.style.fontSize = '1rem'; // 50% smaller
    frontSideLabel.style.fontWeight = 'bold';
    frontSideLabel.style.marginBottom = '3mm';
    frontSideLabel.style.color = '#333333';
    frontSideLabel.textContent = 'Front Side';
    pdfContainer.appendChild(frontSideLabel);

    // Clone the SVG element for the front side
    const svgCloneFront = svgElement.cloneNode(true);
    svgCloneFront.style.margin = '0';
    svgCloneFront.style.alignSelf = 'flex-start'; // Align to the left    
    svgCloneFront.style.borderRadius = '20px';
    svgCloneFront.style.maxHeight = '13cm';  // Constrain height to 13cm
    pdfContainer.appendChild(svgCloneFront);

    // "Reverse side" label
    const reverseSideLabel = document.createElement('div');
    reverseSideLabel.style.fontSize = '1rem'; // 50% smaller
    reverseSideLabel.style.fontWeight = 'bold';
    reverseSideLabel.style.marginTop = '5mm';
    reverseSideLabel.style.marginBottom = '3mm';
    reverseSideLabel.style.color = '#333333';
    reverseSideLabel.textContent = 'Reverse Side';
    pdfContainer.appendChild(reverseSideLabel);

    // Clone the SVG element for the reverse side and flip it
    const svgCloneReverse = svgElement.cloneNode(true);
    svgCloneReverse.style.maxHeight = '13cm';  // Constrain height to 13cm
    svgCloneReverse.style.margin = '0';
    svgCloneReverse.style.alignSelf = 'flex-start'; // Align to the left
    svgCloneReverse.style.borderRadius = '20px';
    svgCloneReverse.style.transform = 'scaleX(-1)'; // Flip horizontally
    pdfContainer.appendChild(svgCloneReverse);

    // Add "Good luck!" message
    const goodLuckMessage = document.createElement('div');
    goodLuckMessage.style.fontSize = '1rem'; // 50% smaller
    goodLuckMessage.style.fontWeight = 'bold';
    goodLuckMessage.style.marginTop = '10mm';
    goodLuckMessage.style.color = '#333333';
    goodLuckMessage.textContent = 'Good luck!';
    pdfContainer.appendChild(goodLuckMessage);

    // Append the container to the body temporarily for rendering
    document.body.appendChild(pdfContainer);

    // Convert the PDF container to a canvas with a higher scale factor
    const scaleFactor = 2; // Increase scale factor for higher resolution
    const canvas = await html2canvas(pdfContainer, {
      scale: scaleFactor,
      backgroundColor: '#ffffff',
    });

    // Remove the container from the body after rendering
    document.body.removeChild(pdfContainer);

    // Generate the PDF from the canvas
    const imgData = canvas.toDataURL("image/jpeg", 1.0); // Use maximum quality
    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297); // A4 dimensions in mm

    // Save the single-page PDF
    pdf.save("download.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("An error occurred while generating the PDF. Please try again.");
  }
}

// Ensure only one event listener is attached to the save button
document.getElementById('saveButton').addEventListener('click', saveAsPDF);

function toggleButtons() {
  const shapeSelector = document.getElementById('shapeSelector');
  const saveButton = document.getElementById('saveButton');
  const orderButton = document.getElementById('orderButton'); // Check if orderButton exists

  if (shapeSelector.value) {
    saveButton.style.display = 'inline-block';
    if (orderButton) orderButton.style.display = 'inline-block'; // Only show if it exists
  } else {
    saveButton.style.display = 'none';
    if (orderButton) orderButton.style.display = 'none'; // Only hide if it exists
  }
}

// Run when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  populateSVGSelector();
  populateColorPresets(); // Populate color presets from the database
  toggleButtons();
  toggleColorPickers();  // Ensure color pickers are hidden by default on page load

  // Ensure only one event listener is attached to the save button
  const saveButton = document.getElementById('saveButton');
  saveButton.removeEventListener('click', saveAsPDF); // Remove any existing listeners
  saveButton.addEventListener('click', saveAsPDF);    // Add the event listener again
  
  // Add event listener for the preset dropdown
  const colorPresetSelector = document.getElementById('colorPresetSelector');
  colorPresetSelector.addEventListener('change', (event) => {
    toggleCustomColorPickers(event.target.value);
  });
});