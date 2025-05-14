// Make sure LucideReact is properly accessed
const LucideReact = window.LucideReact || {};

// Extract icon components from Lucide - add fallback for safety
const { 
  Printer, 
  AlertCircle, 
  Flag, 
  Mountain, 
  Coffee, 
  Wind, 
  CheckCircle, 
  Upload, 
  Plus, 
  X, 
  Eye, 
  Users,
  Save,
  Download,
  FileUp
} = LucideReact;

// Backup function to render icons if direct imports fail
const renderIcon = (iconName, size = 20) => {
  // Try LucideReact first
  if (LucideReact && LucideReact[iconName]) {
    return React.createElement(LucideReact[iconName], { size });
  }
  // Fall back to Lucide
  else if (window.lucide && window.lucide[iconName]) {
    return React.createElement(window.lucide[iconName], { size });
  }
  // Last resort: render a placeholder
  return <div style={{ width: size, height: size, backgroundColor: '#ccc', borderRadius: '4px' }}></div>;
};

// Function to safely render an icon component with fallback
const safeRenderIcon = (IconComponent, size = 20) => {
  try {
    return <IconComponent size={size} />;
  } catch (error) {
    console.warn(`Failed to render icon component: ${error.message}`);
    const iconName = IconComponent ? IconComponent.name || 'Unknown' : 'Unknown';
    return renderIcon(iconName, size);
  }
};

// Main Race Planner Component
const RacePlanner = () => {
  // Race details state
  const [raceDetails, setRaceDetails] = React.useState({
    raceName: "Spring Classic",
    date: "2025-05-20",
    distance: 120,
    startTime: "09:00"
  });
  
  // Icons state
  const [icons, setIcons] = React.useState([
    { id: 1, type: 'mountain', position: 25, description: 'Cat 2 Climb', icon: 'Mountain', custom: false },
    { id: 2, type: 'feed', position: 50, description: 'Feed Zone - Water Bottles', icon: 'Coffee', custom: false, feedDetails: { provider: 'Team Car', type: 'Water Bottles' } },
    { id: 3, type: 'sprint', position: 75, description: 'Intermediate Sprint', icon: 'Wind', custom: false },
    { id: 4, type: 'danger', position: 95, description: 'Sharp Turn', icon: 'AlertCircle', custom: false },
    { id: 5, type: 'finish', position: 120, description: 'Finish Line', icon: 'Flag', custom: false }
  ]);
  
  // Available icons
  const [availableIcons, setAvailableIcons] = React.useState([
    { type: 'mountain', description: 'Climb', icon: 'Mountain', custom: false },
    { type: 'feed', description: 'Feed Zone', icon: 'Coffee', custom: false },
    { type: 'sprint', description: 'Sprint', icon: 'Wind', custom: false },
    { type: 'danger', description: 'Danger', icon: 'AlertCircle', custom: false },
    { type: 'finish', description: 'Finish', icon: 'Flag', custom: false },
    { type: 'checkpoint', description: 'Checkpoint', icon: 'CheckCircle', custom: false },
    { type: 'team', description: 'Team Support', icon: 'Users', custom: false }
  ]);
  
  // UI state
  const [customIconsModal, setCustomIconsModal] = React.useState(false);
  const [feedDetailsModal, setFeedDetailsModal] = React.useState({ open: false, iconId: null });
  const [newIconName, setNewIconName] = React.useState("");
  const [newIconFile, setNewIconFile] = React.useState(null);
  const [customIconsPreview, setCustomIconsPreview] = React.useState([]);
  const [draggingIcon, setDraggingIcon] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [printPreviewFullscreen, setPrintPreviewFullscreen] = React.useState(false);
  const [newIconPosition, setNewIconPosition] = React.useState("");
  const [newIconType, setNewIconType] = React.useState("");
  const [newIconDescription, setNewIconDescription] = React.useState("");
  const [teamLogo, setTeamLogo] = React.useState(null);
  const [feedDetails, setFeedDetails] = React.useState({ provider: "", type: "Water Bottles" });
  const [importFileModal, setImportFileModal] = React.useState(false);
  
  // Refs
  const stemRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const logoInputRef = React.useRef(null);
  const importFileRef = React.useRef(null);
  
  // Add error handling to hide loading indicator when component mounts
  React.useEffect(() => {
    // Hide loading indicator when component mounts
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }, []);
  
  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRaceDetails({
      ...raceDetails,
      [name]: value
    });
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomIconsPreview([...customIconsPreview, {
          id: Date.now(),
          src: e.target.result,
          name: newIconName || file.name.split('.')[0]
        }]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTeamLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (iconType, isCustom = false, customSrc = null) => {
    setDraggingIcon({ type: iconType, isCustom, customSrc });
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggingIcon) return;
    
    const stemRect = stemRef.current.getBoundingClientRect();
    const dropX = e.clientX - stemRect.left;
    const dropPosition = Math.round((dropX / stemRect.width) * raceDetails.distance * 10) / 10;
    
    if (draggingIcon.isCustom) {
      const newIcon = {
        id: Date.now(),
        type: 'custom',
        position: dropPosition,
        description: 'Custom Icon',
        customSrc: draggingIcon.customSrc,
        custom: true
      };
      setIcons([...icons, newIcon]);
    } else {
      const foundIcon = availableIcons.find(icon => icon.type === draggingIcon.type);
      if (foundIcon) {
        const newIcon = {
          id: Date.now(),
          type: draggingIcon.type,
          position: dropPosition,
          description: foundIcon.description,
          icon: foundIcon.icon,
          custom: false,
          feedDetails: draggingIcon.type === 'feed' ? { provider: 'Team Staff', type: 'Water Bottles' } : null
        };
        setIcons([...icons, newIcon]);
        
        // Auto-open feed details modal for feed icons
        if (draggingIcon.type === 'feed') {
          setFeedDetailsModal({ open: true, iconId: newIcon.id });
        }
      }
    }
    
    setDraggingIcon(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  // Icon management
  const addIconByKm = () => {
    if (!newIconPosition || !newIconType) return;
    
    const position = parseFloat(newIconPosition);
    if (isNaN(position) || position < 0 || position > raceDetails.distance) return;
    
    const foundIcon = availableIcons.find(icon => icon.type === newIconType);
    if (foundIcon) {
      const newIcon = {
        id: Date.now(),
        type: newIconType,
        position: position,
        description: newIconDescription || foundIcon.description,
        icon: foundIcon.icon,
        custom: false,
        feedDetails: newIconType === 'feed' ? { provider: 'Team Staff', type: 'Water Bottles' } : null
      };
      
      setIcons([...icons, newIcon]);
      setNewIconPosition("");
      setNewIconDescription("");
      
      // Auto-open feed details modal for feed icons
      if (newIconType === 'feed') {
        setFeedDetailsModal({ open: true, iconId: newIcon.id });
      }
    }
  };
  
  const handleIconPositionChange = (id, newPosition) => {
    setIcons(icons.map(icon => 
      icon.id === id ? { ...icon, position: parseFloat(newPosition) } : icon
    ));
  };
  
  const handleIconDescriptionChange = (id, newDescription) => {
    setIcons(icons.map(icon => 
      icon.id === id ? { ...icon, description: newDescription } : icon
    ));
  };
  
  const handleRemoveIcon = (id) => {
    setIcons(icons.filter(icon => icon.id !== id));
  };

  // Custom icons
  const addCustomIcon = () => {
    if (!newIconFile || !newIconName) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const newCustomIcon = {
        type: `custom-${Date.now()}`,
        description: newIconName,
        customSrc: e.target.result,
        custom: true
      };
      
      setAvailableIcons([...availableIcons, newCustomIcon]);
      setNewIconName("");
      setNewIconFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(newIconFile);
  };
  
  const removeCustomIcon = (type) => {
    setAvailableIcons(availableIcons.filter(icon => icon.type !== type));
  };
  
  // Feed zone details
  const openFeedDetailsModal = (iconId) => {
    const icon = icons.find(icon => icon.id === iconId);
    if (icon && icon.feedDetails) {
      setFeedDetails(icon.feedDetails);
    } else {
      setFeedDetails({ provider: "", type: "Water Bottles" });
    }
    setFeedDetailsModal({ open: true, iconId });
  };
  
  const updateFeedDetails = () => {
    setIcons(icons.map(icon => 
      icon.id === feedDetailsModal.iconId 
        ? { ...icon, feedDetails: feedDetails, description: `Feed Zone - ${feedDetails.type} (${feedDetails.provider})` } 
        : icon
    ));
    setFeedDetailsModal({ open: false, iconId: null });
  };

  // Local storage functionality to save and load race plans
  const saveRacePlan = () => {
    try {
      const raceData = {
        raceDetails: raceDetails,
        icons: icons,
        teamLogo: teamLogo
      };
      localStorage.setItem('racePlanData', JSON.stringify(raceData));
      alert('Race plan saved successfully!');
    } catch (error) {
      console.error('Error saving race plan:', error);
      alert('Failed to save race plan. Please try again.');
    }
  };
  
  const loadRacePlan = () => {
    try {
      const savedData = localStorage.getItem('racePlanData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setRaceDetails(parsedData.raceDetails || raceDetails);
        setIcons(parsedData.icons || icons);
        setTeamLogo(parsedData.teamLogo || null);
        alert('Race plan loaded successfully!');
      } else {
        alert('No saved race plan found.');
      }
    } catch (error) {
      console.error('Error loading race plan:', error);
      alert('Failed to load race plan.');
    }
  };
  
  // File export/import functionality
  const exportRacePlan = () => {
    try {
      const raceData = {
        raceDetails: raceDetails,
        icons: icons,
        teamLogo: teamLogo
      };
      
      const dataStr = JSON.stringify(raceData);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${raceDetails.raceName.replace(/\s+/g, '-').toLowerCase()}-plan.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting race plan:', error);
      alert('Failed to export race plan. Please try again.');
    }
  };

  const importRacePlan = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          if (parsedData.raceDetails && parsedData.icons) {
            setRaceDetails(parsedData.raceDetails);
            setIcons(parsedData.icons);
            if (parsedData.teamLogo) {
              setTeamLogo(parsedData.teamLogo);
            }
            setImportFileModal(false);
            alert('Race plan imported successfully!');
          } else {
            alert('Invalid race plan file format.');
          }
        } catch (error) {
          console.error('Error parsing race plan file:', error);
          alert('Failed to parse race plan file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing race plan:', error);
      alert('Failed to import race plan. Please try again.');
    }
  };
  
  // Print functionality
  const printStem = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Bike Stem Race Details</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial; margin: 0; padding: 10px; }');
    printWindow.document.write('.stem-container { width: 100%; max-width: 600px; margin: 0 auto; }');
    printWindow.document.write('.stem-print { width: 100%; height: 60px; border: 2px solid #000; position: relative; background: white; overflow: visible; border-radius: 4px; }');
    printWindow.document.write('.icon-item { position: absolute; display: flex; flex-direction: column; align-items: center; top: 5px; }');
    printWindow.document.write('.icon-item img, .icon-item svg { width: 20px; height: 20px; }');
    printWindow.document.write('.distance-text { font-weight: bold; font-size: 12px; margin-top: 2px; }');
    printWindow.document.write('.description-text { font-size: 9px; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }');
    printWindow.document.write('.printing-instructions { font-size: 9px; color: #666; margin-top: 8px; text-align: center; padding-bottom: 10px; }');
    printWindow.document.write('@media print { .printing-instructions { display: none; } @page { size: landscape; margin: 5mm; } body { padding: 0; } }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    
    // Only print the minimal stem content
    printWindow.document.write('<div class="stem-container">');
    printWindow.document.write('<div class="stem-print">');
    
    // Only add the icons, with prominent kilometer markings
    const sortedIconsForPrint = [...icons].sort((a, b) => a.position - b.position);
    
    sortedIconsForPrint.forEach(icon => {
      const positionPercent = (icon.position / raceDetails.distance) * 100;
      
      printWindow.document.write(`
        <div class="icon-item" style="left: ${positionPercent}%; transform: translateX(-50%);">
          ${icon.custom 
            ? `<img src="${icon.customSrc}" alt="${icon.description}" />` 
            : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${icon.icon.toLowerCase()}"><use xlink:href="#icon-${icon.icon.toLowerCase()}"></use></svg>`
          }
          <div class="distance-text">${icon.position}KM</div>
          <div class="description-text">${icon.description.split(' ')[0]}</div>
        </div>
      `);
    });
    
    printWindow.document.write('</div>');
    printWindow.document.write('<div class="printing-instructions">* Cut along the black outline and attach to bike stem.</div>');
    printWindow.document.write('</div>');
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // Create kilometer markers for the stem
  const createKmMarkers = () => {
    const markers = [];
    const interval = Math.ceil(raceDetails.distance / 20); // One marker every X km, adjusted to fit
    
    for (let i = 0; i <= raceDetails.distance; i += interval) {
      const position = (i / raceDetails.distance) * 100;
      markers.push(
        <div key={i} className="absolute" style={{ left: `${position}%` }}>
          <div className="h-3 border-l border-gray-700"></div>
          <div className="text-xs -ml-2">{i}</div>
        </div>
      );
    }
    
    return markers;
  };

  // Sort icons by position for display
  const sortedIcons = [...icons].sort((a, b) => a.position - b.position);
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header with Logo */}
      <div className="flex items-center mb-6">
        <div className="mr-4 flex items-center">
          {teamLogo ? (
            <div className="relative">
              <img src={teamLogo} alt="Team Logo" className="w-16 h-16 object-contain" />
              <button 
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                onClick={() => setTeamLogo(null)}
              >
                {renderIcon('X', 12)}
              </button>
            </div>
          ) : (
            <div 
              className="w-16 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer"
              onClick={() => logoInputRef.current.click()}
            >
              {renderIcon('Upload', 24)}
              <input 
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold">Bike Race Stem Planner</h1>
      </div>
      
      {/* Save/Load/Export Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
          onClick={saveRacePlan}
        >
          {renderIcon('Save', 16)}
          <span className="ml-1">Save to Browser</span>
        </button>
        <button 
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center text-sm"
          onClick={loadRacePlan}
        >
          {renderIcon('Download', 16)}
          <span className="ml-1">Load from Browser</span>
        </button>
        <button 
          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center text-sm"
          onClick={exportRacePlan}
        >
          {renderIcon('Download', 16)}
          <span className="ml-1">Export to File</span>
        </button>
        <button 
          className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center text-sm"
          onClick={() => setImportFileModal(true)}
        >
          {renderIcon('FileUp', 16)}
          <span className="ml-1">Import from File</span>
        </button>
      </div>
      
      {/* Race Details Form */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Race Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Race Name</label>
            <input
              type="text"
              name="raceName"
              value={raceDetails.raceName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={raceDetails.date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Distance (km)</label>
            <input
              type="number"
              name="distance"
              value={raceDetails.distance}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={raceDetails.startTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      {/* Available Icons */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Available Icons</h2>
          <button 
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
            onClick={() => setCustomIconsModal(true)}
          >
            {renderIcon('Plus', 16)}
            <span className="ml-1">Add Custom Icon</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-4 p-4 border rounded bg-gray-50">
          {availableIcons.map((icon, index) => (
            <div
              key={index}
              className="p-2 border rounded bg-white cursor-grab flex flex-col items-center"
              draggable
              onDragStart={() => handleDragStart(icon.type, icon.custom, icon.customSrc)}
            >
              {icon.custom ? (
                <img src={icon.customSrc} alt={icon.description} className="w-6 h-6" />
              ) : (
                renderIcon(icon.icon, 20)
              )}
              <span className="text-xs mt-1">{icon.description}</span>
              {icon.custom && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomIcon(icon.type);
                  }}
                  className="mt-1 text-red-500 hover:text-red-700"
                >
                  {renderIcon('X', 12)}
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm mt-2 text-gray-600">Drag and drop icons onto the race stem below. For feeding zones, you'll be able to specify provider and feeding type.</p>
      </div>
      
      {/* Add Icon by Kilometer */}
      <div className="mb-8 p-4 border rounded bg-gray-100">
        <h2 className="text-lg font-semibold mb-4">Add Icon by Kilometer</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Position (km)</label>
            <input
              type="number"
              min="0"
              max={raceDetails.distance}
              step="0.1"
              value={newIconPosition}
              onChange={(e) => setNewIconPosition(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter kilometer position"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Icon Type</label>
            <select
              value={newIconType}
              onChange={(e) => setNewIconType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select icon type</option>
              {availableIcons.map((icon, index) => (
                <option key={index} value={icon.type}>
                  {icon.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Description (optional)</label>
            <input
              type="text"
              value={newIconDescription}
              onChange={(e) => setNewIconDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter description"
            />
          </div>
          <button
            onClick={addIconByKm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Race Stem */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Race Stem Design</h2>
        <div 
          ref={stemRef}
          className="w-full h-24 border-2 border-gray-400 rounded-lg bg-white relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Distance markers */}
          <div className="absolute w-full flex justify-between px-2 -top-6">
            {createKmMarkers()}
          </div>
          
          {/* Distance scale lines */}
          <div className="absolute top-0 left-0 w-full h-4 flex justify-between border-b border-gray-300">
            {Array.from({ length: 21 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`h-3 border-l ${idx % 5 === 0 ? 'border-gray-700' : 'border-gray-300'}`} 
                style={{ left: `${idx * 5}%` }} 
              />
            ))}
          </div>
          
          {/* Placed icons */}
          {sortedIcons.map((icon) => (
            <div
              key={icon.id}
              className="absolute top-6 flex flex-col items-center"
              style={{ 
                left: `${(icon.position / raceDetails.distance) * 100}%`, 
                transform: 'translateX(-50%)' 
              }}
            >
              {icon.custom ? (
                <img src={icon.customSrc} alt={icon.description} className="w-6 h-6" />
              ) : (
                renderIcon(icon.icon, 20)
              )}
              <span className="text-xs mt-1 font-bold">{icon.position}KM</span>
              <span className="text-xs mt-1 max-w-16 text-center truncate">{icon.description.split(' ')[0]}</span>
              {icon.type === 'feed' && icon.feedDetails && (
                <button 
                  className="mt-1 text-xs text-blue-600 underline"
                  onClick={() => openFeedDetailsModal(icon.id)}
                >
                  Edit details
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Icon Details */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Icon Details</h2>
        <div className="border rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Icon</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Position (km)</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedIcons.map((icon) => (
                <tr key={icon.id} className="border-t">
                  <td className="p-2">
                    {icon.custom ? (
                      <img src={icon.customSrc} alt={icon.description} className="w-6 h-6" />
                    ) : (
                      renderIcon(icon.icon, 20)
                    )}
                  </td>
                  <td className="p-2 capitalize">{icon.type}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      max={raceDetails.distance}
                      step="0.1"
                      value={icon.position}
                      onChange={(e) => handleIconPositionChange(icon.id, e.target.value)}
                      className="w-16 p-1 border rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={icon.description}
                      onChange={(e) => handleIconDescriptionChange(icon.id, e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                    {icon.type === 'feed' && icon.feedDetails && (
                      <div className="mt-1 text-xs">
                        <span className="font-semibold">Provider:</span> {icon.feedDetails.provider} | 
                        <span className="font-semibold"> Type:</span> {icon.feedDetails.type}
                        <button 
                          onClick={() => openFeedDetailsModal(icon.id)}
                          className="ml-2 text-blue-600 underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => handleRemoveIcon(icon.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {icons.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No icons added yet. Drag and drop icons onto the race stem or add by kilometer position.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Preview and Print */}
      <div className="mb-8 flex gap-4">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          onClick={() => {
            setShowPreview(!showPreview);
            setPrintPreviewFullscreen(false);
          }}
        >
          {renderIcon('Eye', 18)}
          <span className="ml-2">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
        </button>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          onClick={printStem}
        >
          {renderIcon('Printer', 18)}
          <span className="ml-2">Print Stem</span>
        </button>
        {showPreview && (
          <button 
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center"
            onClick={() => setPrintPreviewFullscreen(!printPreviewFullscreen)}
          >
            <span className="ml-2">{printPreviewFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}</span>
          </button>
        )}
      </div>
      
      {/* Print Preview */}
      {showPreview && (
        <div className={`${printPreviewFullscreen ? 'fixed inset-0 z-50 bg-white p-8 overflow-auto' : 'mt-8 p-4 border rounded'}`}>
          {printPreviewFullscreen && (
            <button 
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setPrintPreviewFullscreen(false)}
            >
              {renderIcon('X', 18)}
            </button>
          )}
          
          <h2 className="text-lg font-semibold mb-4">Print Preview</h2>
          <div id="print-area" className={printPreviewFullscreen ? 'max-w-4xl mx-auto' : ''}>
            <div className="mb-4">
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-medium">Preview only - the printed version will be minimal, showing only icons and distances for fitting on bike stems.</p>
              </div>
            </div>
            {/* Race details - shown only in preview, not in print */}
            <div className="race-info mb-4">
              {teamLogo && (
                <img src={teamLogo} alt="Team Logo" className="w-12 h-12 mr-4 object-contain" />
              )}
              <div>
                <h2 className="text-lg font-bold">{raceDetails.raceName}</h2>
                <div className="text-sm">Date: {raceDetails.date} | Distance: {raceDetails.distance} km | Start: {raceDetails.startTime}</div>
              </div>
            </div>
            
            {/* Stem preview */}
            <div className="w-full h-16 border-2 border-gray-700 rounded bg-white relative">
              {/* Placed icons */}
              {sortedIcons.map((icon) => (
                <div
                  key={icon.id}
                  className="absolute top-1 flex flex-col items-center"
                  style={{ 
                    left: `${(icon.position / raceDetails.distance) * 100}%`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {icon.custom ? (
                    <img src={icon.customSrc} alt={icon.description} className="w-5 h-5" />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                      {renderIcon(icon.icon, 16)}
                    </div>
                  )}
                  <span className="text-[10px] font-bold">{icon.position}KM</span>
                  <span className="text-[8px] max-w-16 text-center truncate">{icon.description.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              * When printed, only the stem with icons will be included, sized appropriately for bike stems.
            </div>
          </div>
        </div>
      )}

      {/* Feed Details Modal */}
      {feedDetailsModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h2 className="text-lg font-semibold mb-4">Feed Zone Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Provider</label>
              <input
                type="text"
                value={feedDetails.provider}
                onChange={(e) => setFeedDetails({...feedDetails, provider: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Who is providing feed? (e.g. Team Car 1, Soigneur John)"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Feed Type</label>
              <select
                value={feedDetails.type}
                onChange={(e) => setFeedDetails({...feedDetails, type: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="Water Bottles">Water Bottles</option>
                <option value="Energy Gels">Energy Gels</option>
                <option value="Feeding Bag">Feeding Bag</option>
                <option value="Musette Bag">Musette Bag</option>
                <option value="Bottles & Food">Bottles & Food</option>
                <option value="Full Support">Full Support</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setFeedDetailsModal({ open: false, iconId: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={updateFeedDetails}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Icons Modal */}
      {customIconsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h2 className="text-lg font-semibold mb-4">Add Custom Icon</h2>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Icon Name</label>
              <input
                type="text"
                value={newIconName}
                onChange={(e) => setNewIconName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter icon name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Upload Icon</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {customIconsPreview.length > 0 && (
              <div className="mb-4">
                <p className="text-sm mb-2">Preview:</p>
                <div className="flex flex-wrap gap-2">
                  {customIconsPreview.map((preview) => (
                    <div key={preview.id} className="border p-2 rounded flex flex-col items-center">
                      <img src={preview.src} alt={preview.name} className="w-8 h-8 object-contain" />
                      <span className="text-xs mt-1">{preview.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setCustomIconsModal(false);
                  setNewIconName("");
                  setNewIconFile(null);
                  setCustomIconsPreview([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  addCustomIcon();
                  setCustomIconsModal(false);
                  setCustomIconsPreview([]);
                }}
                disabled={!newIconFile || !newIconName}
              >
                Add Icon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import File Modal */}
      {importFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h2 className="text-lg font-semibold mb-4">Import Race Plan</h2>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Select Race Plan File (.json)</label>
              <input
                type="file"
                ref={importFileRef}
                accept=".json"
                onChange={importRacePlan}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setImportFileModal(false);
                  if (importFileRef.current) {
                    importFileRef.current.value = "";
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Render with error handling
try {
  ReactDOM.render(<RacePlanner />, document.getElementById('root'));
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  document.getElementById('loading').innerHTML = `
    <div style="background-color: #FEE2E2; border: 1px solid #F87171; color: #B91C1C; padding: 1rem; border-radius: 0.25rem;">
      <h2 style="font-weight: bold;">Error loading application</h2>
      <p style="margin-top: 0.5rem;">${error.message}</p>
      <p style="margin-top: 0.75rem;">Please check the browser console for details.</p>
    </div>
  `;
}