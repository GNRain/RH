import React from 'react';
import './Sidebar.css';
import logo from '../../assets/logo.png';
import { NavLink } from 'react-router-dom'; // --- ADD IMPORT ---

// --- DEFINE TYPES FOR PROPS ---
interface NavItem {
  path: string;
  label: string;
}

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="HRG Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        {/* --- MAP OVER THE navItems PROP TO RENDER DYNAMIC LINKS --- */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}