import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { ToolbarTool } from "../types";

interface ToolsMenuProps {
  tools: ToolbarTool[];
  onSelectTool: (toolId: string) => void;
}

export function ToolsMenu({ tools, onSelectTool }: ToolsMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="font-inter text-base text-black hover:text-green-600 transition-colors">
        Tools
      </MenuButton>
      <MenuItems className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 focus:outline-noneabsolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
        {tools.map(tool => (
         <MenuItem
            as="button"
            onClick={() => onSelectTool(tool.id)}
            className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
            >
            <span className="ml-2">{tool.label}</span>
            </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}