import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";

interface ToolbarTool {
  id: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isSelected?: boolean;
}

interface Layer {
  id: string;
  name: string;
  color?: string;
  visible: boolean;
  locked: boolean;
}

export default function Annotation() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeFiles, setActiveFiles] = useState([
    { id: "1", name: "Duck.jpg", isActive: true },
    { id: "2", name: "Eagle.jpg", isActive: false },
  ]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchLayers, setSearchLayers] = useState("");
  const [selectedTool, setSelectedTool] = useState("move");
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleCanvasZoom = (direction: "in" | "out" | "reset") => {
    setCanvasZoom(prev => {
      if (direction === "in") return Math.min(prev + 25, 200);
      if (direction === "out") return Math.max(prev - 25, 25);
      return 100; // reset
    });
  };

  const toolbarTools: ToolbarTool[] = [
    {
      id: "move",
      isSelected: selectedTool === "move",
      icon: (
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <g clipPath="url(#clip0_45_456)">
            <path d="M11.2256 4.40509L12.4972 25.5711L18.0318 18.4716L27.0335 18.5375L11.2256 4.40509Z" fill="black"/>
            <path d="M18.3302 19.0883L22.593 27.8982L18.3302 19.0883Z" fill="black"/>
            <path d="M18.3302 19.0883L22.593 27.8982M11.2256 4.40509L12.4972 25.5711L18.0318 18.4716L27.0335 18.5375L11.2256 4.40509Z" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
      ),
    },
    {
      id: "search",
      icon: (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path d="M6.23333 29.7501L15.1583 20.8251C15.8667 21.3918 16.6813 21.8404 17.6021 22.171C18.5229 22.5015 19.5028 22.6668 20.5417 22.6668C23.1153 22.6668 25.2934 21.7755 27.076 19.9928C28.8587 18.2102 29.75 16.0321 29.75 13.4585C29.75 10.8848 28.8587 8.70672 27.076 6.92408C25.2934 5.14144 23.1153 4.25012 20.5417 4.25012C17.9681 4.25012 15.7899 5.14144 14.0073 6.92408C12.2247 8.70672 11.3333 10.8848 11.3333 13.4585C11.3333 14.4973 11.4986 15.4772 11.8292 16.398C12.1597 17.3189 12.6083 18.1335 13.175 18.8418L4.25 27.7668L6.23333 29.7501ZM20.5417 19.8335C18.7708 19.8335 17.2656 19.2137 16.026 17.9741C14.7865 16.7345 14.1667 15.2293 14.1667 13.4585C14.1667 11.6876 14.7865 10.1824 16.026 8.94283C17.2656 7.70325 18.7708 7.08346 20.5417 7.08346C22.3125 7.08346 23.8177 7.70325 25.0573 8.94283C26.2969 10.1824 26.9167 11.6876 26.9167 13.4585C26.9167 15.2293 26.2969 16.7345 25.0573 17.9741C23.8177 19.2137 22.3125 19.8335 20.5417 19.8335Z" fill="#1D1B20"/>
        </svg>
      ),
    },
    {
      id: "expand",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <g clipPath="url(#clip0_72_79)">
            <path d="M21 21.0003H16V24.0003H21.546C22.1968 23.9995 22.8206 23.7406 23.2807 23.2803C23.7408 22.82 23.9995 22.1961 24 21.5453V16.0003H21V21.0003Z" fill="#1E1E1E"/>
            <path d="M0 2.455V8H3V3H8V0H2.454C1.80323 0.000794377 1.17935 0.259732 0.719284 0.719991C0.259213 1.18025 0.000529243 1.80423 0 2.455H0Z" fill="#1E1E1E"/>
            <path d="M3 16.0003H0V21.5453C0.000529243 22.1961 0.259213 22.82 0.719284 23.2803C1.17935 23.7406 1.80323 23.9995 2.454 24.0003H8V21.0003H3V16.0003Z" fill="#1E1E1E"/>
            <path d="M21.546 0H16V3H21V8H24V2.455C23.9995 1.80423 23.7408 1.18025 23.2807 0.719991C22.8206 0.259732 22.1968 0.000794377 21.546 0V0Z" fill="#1E1E1E"/>
          </g>
        </svg>
      ),
    },
    {
      id: "polygon",
      isActive: selectedTool === "polygon",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M28 21.3333V10.6666C27.9995 10.199 27.8761 9.73972 27.6421 9.33485C27.408 8.92999 27.0717 8.59379 26.6667 8.35997L17.3333 3.02664C16.9279 2.79259 16.4681 2.66937 16 2.66937C15.5319 2.66937 15.0721 2.79259 14.6667 3.02664L5.33333 8.35997C4.92835 8.59379 4.59197 8.92999 4.35795 9.33485C4.12392 9.73972 4.00048 10.199 4 10.6666V21.3333C4.00048 21.8009 4.12392 22.2602 4.35795 22.6651C4.59197 23.07 4.92835 23.4062 5.33333 23.64L14.6667 28.9733C15.0721 29.2074 15.5319 29.3306 16 29.3306C16.4681 29.3306 16.9279 29.2074 17.3333 28.9733L26.6667 23.64C27.0717 23.4062 27.408 23.07 27.6421 22.6651C27.8761 22.2602 27.9995 21.8009 28 21.3333Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "line",
      icon: <div className="w-1 h-9 bg-black rounded"></div>,
    },
    {
      id: "pen",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" transform="rotate(-90)">
          <path d="M2.66675 29.3336L7.33341 10.0003L17.3334 8.00025L24.0001 14.6669L22.0001 24.6669L2.66675 29.3336ZM2.66675 29.3336L12.7814 19.2189M25.3334 16.0003L16.0001 6.66692L20.0001 2.66692L29.3334 12.0003L25.3334 16.0003ZM14.6667 14.6669C16.1395 14.6669 17.3334 15.8608 17.3334 17.3336C17.3334 18.8063 16.1395 20.0003 14.6667 20.0003C13.194 20.0003 12.0001 18.8063 12.0001 17.3336C12.0001 15.8608 13.194 14.6669 14.6667 14.6669Z" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "edit",
      icon: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <path d="M7.91764 30.0835H10.1739L25.651 14.6064L23.3947 12.3501L7.91764 27.8272V30.0835ZM4.75098 33.2501V26.521L25.651 5.66054C25.9676 5.37026 26.3173 5.14596 26.6999 4.98762C27.0826 4.82929 27.485 4.75012 27.9072 4.75012C28.3294 4.75012 28.7385 4.82929 29.1343 4.98762C29.5301 5.14596 29.8732 5.38346 30.1635 5.70012L32.3406 7.91679C32.6572 8.20707 32.8881 8.55012 33.0333 8.94596C33.1784 9.34179 33.251 9.73762 33.251 10.1335C33.251 10.5557 33.1784 10.9581 33.0333 11.3407C32.8881 11.7234 32.6572 12.073 32.3406 12.3897L11.4801 33.2501H4.75098ZM24.5031 13.498L23.3947 12.3501L25.651 14.6064L24.5031 13.498Z" fill="#1D1B20"/>
        </svg>
      ),
    },
    {
      id: "text",
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4.66675 8.1669V4.6669H23.3334V8.1669M10.5001 23.3336H17.5001M14.0001 4.6669V23.3336" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "eyedropper",
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <g clipPath="url(#clip0_71_67)">
            <path d="M30 3.77887C30.0016 4.27547 29.9045 4.76743 29.7143 5.22621C29.5242 5.68498 29.2449 6.10142 28.8925 6.45136L24.6338 10.7101C23.8305 11.5057 23.3712 12.5846 23.3546 13.7151C23.3381 14.8456 23.7654 15.9375 24.545 16.7563L22.75 18.5001L11.5 7.25011L13.25 5.45511C14.069 6.23439 15.1609 6.66156 16.2912 6.64497C17.4216 6.62838 18.5005 6.16934 19.2963 5.36636L23.5488 1.10762C24.2684 0.419648 25.2257 0.0357056 26.2213 0.0357056C27.2168 0.0357056 28.1741 0.419648 28.8938 1.10762C29.2457 1.45751 29.5248 1.8738 29.7147 2.33234C29.9046 2.79088 30.0016 3.28256 30 3.77887ZM2.39125 22.1013C1.81274 22.6731 1.43061 23.4138 1.29988 24.2166C1.16914 25.0194 1.29655 25.843 1.66375 26.5688L0 28.2326L1.7675 30.0001L3.43125 28.3363C4.15705 28.7035 4.98066 28.8309 5.78349 28.7002C6.58632 28.5695 7.32695 28.1873 7.89875 27.6088L17.96 17.5476L12.4525 12.0401L2.39125 22.1013Z" fill="#1E1E1E"/>
          </g>
        </svg>
      ),
    },
  ];

  const colorPalette = ["#3B3B3B", "#5CBF7D"];

  const layers: Layer[] = [
    { id: "1", name: "Bounding Boxes (1)", visible: true, locked: false },
    { id: "2", name: "Neck Lines (1)", color: "#5CBF7D", visible: true, locked: false },
    { id: "3", name: "Body Lines (1)", visible: true, locked: false },
    { id: "4", name: "Tail Lines (1)", visible: true, locked: false },
    { id: "5", name: "Beak Lines (1)", visible: true, locked: false },
    { id: "6", name: "Left Leg Lines (2)", visible: true, locked: false },
    { id: "7", name: "Right Leg Lines (2)", visible: true, locked: false },
  ];

  const closeFile = (fileId: string) => {
    setActiveFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const switchFile = (fileId: string) => {
    setActiveFiles(prev => 
      prev.map(file => ({ ...file, isActive: file.id === fileId }))
    );
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-300">
        {/* Logo */}
        <div className="h-28 flex items-center px-4">
          <Link
            to="/dashboard"
            className="w-16 h-16 bg-ml-green rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors cursor-pointer"
          >
            <span className="font-inter font-bold text-xs text-white">ML Tool</span>
          </Link>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-10 px-4 py-4 border-b border-gray-300 bg-white relative">
          {/* File Menu */}
          <div className="relative">
            <button
              className="font-inter text-base text-black hover:text-ml-green transition-colors"
              onClick={() => setShowFileMenu(!showFileMenu)}
            >
              File
            </button>
            {showFileMenu && (
              <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowFileMenu(false); console.log("New Project")}}>New Project</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowFileMenu(false); console.log("Open")}}>Open</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowFileMenu(false); console.log("Save")}}>Save</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowFileMenu(false); setShowExportModal(true)}}>Export...</button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowFileMenu(false); navigate("/dashboard")}}>Close Project</button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              className="font-inter text-base text-black hover:text-ml-green transition-colors"
              onClick={() => setShowEditMenu(!showEditMenu)}
            >
              Edit
            </button>
            {showEditMenu && (
              <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowEditMenu(false); console.log("Undo")}}>Undo</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowEditMenu(false); console.log("Redo")}}>Redo</button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowEditMenu(false); console.log("Cut")}}>Cut</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowEditMenu(false); console.log("Copy")}}>Copy</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowEditMenu(false); console.log("Paste")}}>Paste</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowEditMenu(false); console.log("Delete")}}>Delete</button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              className="font-inter text-base text-black hover:text-ml-green transition-colors"
              onClick={() => setShowViewMenu(!showViewMenu)}
            >
              View
            </button>
            {showViewMenu && (
              <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowViewMenu(false); handleCanvasZoom("in")}}>Zoom In</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowViewMenu(false); handleCanvasZoom("out")}}>Zoom Out</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowViewMenu(false); handleCanvasZoom("reset")}}>Actual Size</button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowViewMenu(false); console.log("Show Grid")}}>Show Grid</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {setShowViewMenu(false); console.log("Show Rulers")}}>Show Rulers</button>
              </div>
            )}
          </div>

          <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Annotation menu")}>Annotation</button>
          <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Layers menu")}>Layers</button>
          <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Tools menu")}>Tools</button>
          <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => setShowShareModal(true)}>Collaboration</button>
          <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Settings menu")}>Settings</button>
          <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Help menu")}>Help</button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <nav className="flex items-center space-x-2 text-sm font-inter">
            <Link to="/dashboard" className="text-ml-green hover:text-ml-green/80 transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Projects</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Duck Annotation #{projectId}</span>
          </nav>
        </div>

        {/* File Tabs and Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          {/* File Tabs */}
          <div className="flex items-center gap-2">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
                  file.isActive ? "bg-ml-green text-white" : "bg-white text-black border border-gray-300"
                }`}
                onClick={() => switchFile(file.id)}
              >
                <span className="font-inter text-base">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className="hover:opacity-70"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M9.75 3.25L3.25 9.75M3.25 3.25L9.75 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-4">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
              <g clipPath="url(#clip0_72_89)">
                <path d="M20.9997 20.9995H19.2497C19.2479 19.3756 18.602 17.8187 17.4537 16.6705C16.3055 15.5222 14.7486 14.8763 13.1247 14.8745H8.89847V20.4867L0.7671 12.3553C0.274988 11.8631 -0.00146484 11.1955 -0.00146484 10.4995C-0.00146484 9.8034 0.274988 9.13584 0.7671 8.64358L8.89847 0.512207V6.12446H13.1247C15.2126 6.12677 17.2143 6.9572 18.6906 8.43355C20.167 9.90989 20.9974 11.9116 20.9997 13.9995V20.9995Z" fill="#1E1E1E"/>
              </g>
            </svg>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
              <g clipPath="url(#clip0_72_92)">
                <path d="M0.000272751 20.9995H1.75027C1.75213 19.3756 2.39803 17.8187 3.54629 16.6705C4.69455 15.5222 6.25139 14.8763 7.87527 14.8745H12.1015V20.4867L20.2329 12.3553C20.725 11.8631 21.0015 11.1955 21.0015 10.4995C21.0015 9.8034 20.725 9.13584 20.2329 8.64358L12.1015 0.512207V6.12446H7.87527C5.78741 6.12677 3.78571 6.9572 2.30936 8.43355C0.833017 9.90989 0.00259018 11.9116 0.000272751 13.9995V20.9995Z" fill="#757575"/>
              </g>
            </svg>
          </div>

          {/* Share and Export */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 text-ml-green font-inter font-bold"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 22C17.1667 22 16.4583 21.7083 15.875 21.125C15.2917 20.5417 15 19.8333 15 19C15 18.8833 15.0083 18.7625 15.025 18.6375C15.0417 18.5125 15.0667 18.4 15.1 18.3L8.05 14.2C7.76667 14.45 7.45 14.6458 7.1 14.7875C6.75 14.9292 6.38333 15 6 15C5.16667 15 4.45833 14.7083 3.875 14.125C3.29167 13.5417 3 12.8333 3 12C3 11.1667 3.29167 10.4583 3.875 9.875C4.45833 9.29167 5.16667 9 6 9C6.38333 9 6.75 9.07083 7.1 9.2125C7.45 9.35417 7.76667 9.55 8.05 9.8L15.1 5.7C15.0667 5.6 15.0417 5.4875 15.025 5.3625C15.0083 5.2375 15 5.11667 15 5C15 4.16667 15.2917 3.45833 15.875 2.875C16.4583 2.29167 17.1667 2 18 2C18.8333 2 19.5417 2.29167 20.125 2.875C20.7083 3.45833 21 4.16667 21 5C21 5.83333 20.7083 6.54167 20.125 7.125C19.5417 7.70833 18.8333 8 18 8C17.6167 8 17.25 7.92917 16.9 7.7875C16.55 7.64583 16.2333 7.45 15.95 7.2L8.9 11.3C8.93333 11.4 8.95833 11.5125 8.975 11.6375C8.99167 11.7625 9 11.8833 9 12C9 12.1167 8.99167 12.2375 8.975 12.3625C8.95833 12.4875 8.93333 12.6 8.9 12.7L15.95 16.8C16.2333 16.55 16.55 16.3542 16.9 16.2125C17.25 16.0708 17.6167 16 18 16C18.8333 16 19.5417 16.2917 20.125 16.875C20.7083 17.4583 21 18.1667 21 19C21 19.8333 20.7083 20.5417 20.125 21.125C19.5417 21.7083 18.8333 22 18 22Z" fill="#5CBF7D"/>
              </svg>
              SHARE
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 text-ml-green font-inter font-bold"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V9M12 4.5L9 1.5M9 1.5L6 4.5M9 1.5V11.25" stroke="#5CBF7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              EXPORT
            </button>
          </div>

          {/* User Avatars */}
          <div className="flex items-center gap-2">
            {/* Current User - Main User with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-9 h-9 bg-ml-green rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
              >
                <span className="text-white font-inter font-bold">J</span>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-inter font-medium text-sm text-gray-900">John Doe</p>
                    <p className="font-inter text-xs text-gray-500">john.doe@email.com</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                      <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Dashboard
                  </Link>

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                    onClick={() => {
                      setShowUserDropdown(false);
                      console.log("Settings clicked");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0823 3.74269 9.97512 4.01131 9.78251C4.27993 9.5899 4.48240 9.32074 4.59 9.01C4.72312 8.70838 4.76282 8.37381 4.704 8.04941C4.64519 7.72502 4.49054 7.42568 4.26 7.19L4.2 7.13C4.01405 6.94425 3.86653 6.72368 3.76588 6.48088C3.66523 6.23808 3.61343 5.97783 3.61343 5.715C3.61343 5.45217 3.66523 5.19192 3.76588 4.94912C3.86653 4.70632 4.01405 4.48575 4.2 4.3C4.38575 4.11405 4.60632 3.96653 4.84912 3.86588C5.09192 3.76523 5.35217 3.71343 5.615 3.71343C5.87783 3.71343 6.13808 3.76523 6.38088 3.86588C6.62368 3.96653 6.84425 4.11405 7.03 4.3L7.09 4.36C7.32568 4.59054 7.62502 4.73519 7.94941 4.794C8.27381 4.85282 8.60838 4.81312 8.91 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Settings
                  </button>

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                    onClick={() => {
                      setShowUserDropdown(false);
                      console.log("Help clicked");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                      <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Help & Support
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-inter"
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate("/");
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Collaborator Avatars */}
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-inter font-bold">J</span>
            </div>
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-inter font-bold">J</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Toolbar */}
        <div className="w-24 bg-white border-r border-gray-300 flex flex-col items-center py-4 gap-5">
          {toolbarTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:opacity-80 ${
                tool.isSelected ? "bg-gray-300" : tool.isActive ? "bg-ml-green" : "bg-gray-200"
              }`}
              title={tool.id.charAt(0).toUpperCase() + tool.id.slice(1)}
            >
              {tool.icon}
            </div>
          ))}

          {/* Color Palette */}
          <div className="mt-auto space-y-2">
            {colorPalette.map((color, index) => (
              <div
                key={index}
                className="w-11 h-11 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-200 overflow-hidden relative">
          {/* Canvas Container */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden w-full h-full max-w-4xl max-h-full">
              {/* Main Image */}
              <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/87ad01551a1ce2d72bcf919f3ef50f7b767ba707?width=800"
                  alt="Duck annotation"
                  className="object-contain transition-transform duration-200"
                  style={{
                    width: '700px',
                    height: '500px',
                    transform: `scale(${canvasZoom / 100})`
                  }}
                />

                {/* Annotation Overlays */}
                <div className="absolute inset-0">
                  {/* Bounding Box */}
                  <div className="absolute border-2 border-gray-800 bg-transparent"
                       style={{
                         left: '15%',
                         top: '20%',
                         width: '70%',
                         height: '60%',
                         borderStyle: 'solid'
                       }}>
                  </div>

                  {/* Neck Line (green) */}
                  <div className="absolute"
                       style={{
                         left: '35%',
                         top: '25%',
                         width: '2px',
                         height: '15%',
                         backgroundColor: '#5CBF7D'
                       }}>
                  </div>

                  {/* Body outline points */}
                  <div className="absolute w-2 h-2 bg-gray-800 rounded-full transform -translate-x-1 -translate-y-1"
                       style={{ left: '25%', top: '40%' }}>
                  </div>
                  <div className="absolute w-2 h-2 bg-gray-800 rounded-full transform -translate-x-1 -translate-y-1"
                       style={{ left: '75%', top: '50%' }}>
                  </div>
                  <div className="absolute w-2 h-2 bg-gray-800 rounded-full transform -translate-x-1 -translate-y-1"
                       style={{ left: '80%', top: '35%' }}>
                  </div>

                  {/* Leg lines */}
                  <div className="absolute"
                       style={{
                         left: '40%',
                         top: '75%',
                         width: '1px',
                         height: '10%',
                         backgroundColor: '#333'
                       }}>
                  </div>
                  <div className="absolute"
                       style={{
                         left: '55%',
                         top: '75%',
                         width: '1px',
                         height: '10%',
                         backgroundColor: '#333'
                       }}>
                  </div>

                  {/* Beak annotation */}
                  <div className="absolute w-1 h-6 bg-gray-800"
                       style={{ left: '20%', top: '30%' }}>
                  </div>
                </div>
              </div>

              {/* Canvas Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleCanvasZoom("in")}
                  className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100 transition-colors"
                  title="Zoom In"
                >
                  <span className="text-xs font-bold">+</span>
                </button>
                <button
                  onClick={() => handleCanvasZoom("out")}
                  className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100 transition-colors"
                  title="Zoom Out"
                >
                  <span className="text-xs font-bold">-</span>
                </button>
                <button
                  onClick={() => handleCanvasZoom("reset")}
                  className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100 transition-colors"
                  title="Reset Zoom"
                >
                  <span className="text-xs font-bold">⟲</span>
                </button>
                <div className="ml-2 px-2 py-1 bg-white bg-opacity-80 rounded border border-gray-300 text-xs font-medium">
                  {canvasZoom}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Layers Panel */}
        <div className="w-72 bg-white border-l border-gray-300">
          {/* Search */}
          <div className="p-4 border-b border-gray-300">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Classes..."
                value={searchLayers}
                onChange={(e) => setSearchLayers(e.target.value)}
                className="w-full bg-gray-200 rounded-lg px-3 py-2 pr-10 font-inter text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green"
              />
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <path d="M17.9667 19.25L12.1917 13.475C11.7333 13.8417 11.2063 14.1319 10.6104 14.3458C10.0146 14.5597 9.38056 14.6667 8.70833 14.6667C7.04306 14.6667 5.63368 14.0899 4.48021 12.9365C3.32674 11.783 2.75 10.3736 2.75 8.70833C2.75 7.04306 3.32674 5.63368 4.48021 4.48021C5.63368 3.32674 7.04306 2.75 8.70833 2.75C10.3736 2.75 11.783 3.32674 12.9365 4.48021C14.0899 5.63368 14.6667 7.04306 14.6667 8.70833C14.6667 9.38056 14.5597 10.0146 14.3458 10.6104C14.1319 11.2063 13.8417 11.7333 13.475 12.1917L19.25 17.9667L17.9667 19.25ZM8.70833 12.8333C9.85417 12.8333 10.8281 12.4323 11.6302 11.6302C12.4323 10.8281 12.8333 9.85417 12.8333 8.70833C12.8333 7.5625 12.4323 6.58854 11.6302 5.78646C10.8281 4.98438 9.85417 4.58333 8.70833 4.58333C7.5625 4.58333 6.58854 4.98438 5.78646 5.78646C4.98438 6.58854 4.58333 7.5625 4.58333 8.70833C4.58333 9.85417 4.98438 10.8281 5.78646 11.6302C6.58854 12.4323 7.5625 12.8333 8.70833 12.8333Z" fill="#79747E"/>
              </svg>
            </div>
          </div>

          {/* Layers Header */}
          <div className="bg-gray-200 px-4 py-2">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                <path d="M5 8H19L12 19L5 8Z" fill="#828282"/>
              </svg>
              <span className="font-inter text-base font-semibold text-gray-600">Layers</span>
            </div>
          </div>

          {/* Duck Layer */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-inter text-sm text-black">Duck</span>
              <svg width="16" height="16" viewBox="0 0 18 17" fill="none">
                <path d="M1.6665 8.50002C1.6665 8.50002 4.33317 3.16669 8.99984 3.16669C13.6665 3.16669 16.3332 8.50002 16.3332 8.50002C16.3332 8.50002 13.6665 13.8334 8.99984 13.8334C4.33317 13.8334 1.6665 8.50002 1.6665 8.50002Z" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.99984 10.5C10.1044 10.5 10.9998 9.60459 10.9998 8.50002C10.9998 7.39545 10.1044 6.50002 8.99984 6.50002C7.89527 6.50002 6.99984 7.39545 6.99984 8.50002C6.99984 9.60459 7.89527 10.5 8.99984 10.5Z" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Layer List */}
          <div className="max-h-96 overflow-y-auto">
            {layers.map((layer) => (
              <div key={layer.id} className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className={`font-inter text-sm ${layer.color ? "text-ml-green" : "text-black"}`}>
                    {layer.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 18 17" fill="none" className={layer.color ? "text-ml-green" : "text-black"}>
                      <path d="M1.6665 8.49999C1.6665 8.49999 4.33317 3.16666 8.99984 3.16666C13.6665 3.16666 16.3332 8.49999 16.3332 8.49999C16.3332 8.49999 13.6665 13.8333 8.99984 13.8333C4.33317 13.8333 1.6665 8.49999 1.6665 8.49999Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.99984 10.5C10.1044 10.5 10.9998 9.60456 10.9998 8.49999C10.9998 7.39542 10.1044 6.49999 8.99984 6.49999C7.89527 6.49999 6.99984 7.39542 6.99984 8.49999C6.99984 9.60456 7.89527 10.5 8.99984 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" className={layer.color ? "text-ml-green" : "text-black"}>
                      <g clipPath="url(#clip0_93_92)">
                        <path d="M4.08383 5.16797H9.91628V4.58473C9.91672 2.97416 8.61144 1.66814 7.00086 1.6677C5.93968 1.6674 4.96209 2.24359 4.44835 3.17212C4.29197 3.4538 3.93683 3.5554 3.65515 3.39901C3.37347 3.24263 3.27188 2.88749 3.42826 2.60581C4.52045 0.633173 7.00499 -0.0805829 8.97766 1.01161C10.2771 1.73105 11.0833 3.09945 11.0828 4.58476V5.41531C12.1443 5.87858 12.831 6.92607 12.8325 8.08424V11.5837C12.8306 13.1935 11.5261 14.498 9.91628 14.4999H4.08383C2.47405 14.498 1.16954 13.1935 1.1676 11.5837V8.08424C1.16954 6.4744 2.47405 5.16989 4.08383 5.16797ZM6.41681 10.4172C6.41681 10.7393 6.67793 11.0004 7.00004 11.0004C7.32216 11.0004 7.58328 10.7393 7.58328 10.4172V9.25068C7.58328 8.92857 7.32216 8.66744 7.00004 8.66744C6.67793 8.66744 6.41681 8.92857 6.41681 9.25068V10.4172Z" fill="currentColor"/>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareProject
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectName="Duck Annotation"
      />
      <Export
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectData={{
          name: "Duck",
          annotations: {},
          image: "duck.jpg"
        }}
      />
    </div>
  );
}
