import React from 'react';
import { Link } from 'react-router-dom';
import {
  Squares2X2Icon,
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/solid";

const navItems = [
  { icon: Squares2X2Icon, label: 'Dashboards', path: '/dashboard' },
  { icon: UsersIcon, label: 'People', path: '/people' },
  { icon: CubeIcon, label: 'Product', path: '/product', badge: 'Live' },
  { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
  { icon: ChatBubbleLeftRightIcon, label: 'Engagement', path: '/engagement' },
  { icon: WrenchScrewdriverIcon, label: 'Feedback', path: '/feedback' },
];

const bottomNavItems = [
  { icon: Squares2X2Icon, label: 'Production', path: '/production' },
  { icon: QuestionMarkCircleIcon, label: 'Get Help', path: '/help' },
  { icon: Cog6ToothIcon, label: 'Configure', path: '/configure' },
];

export function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-[#1a1f2e] flex flex-col items-center text-white">
      <div className="p-4">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#1a1f2e] font-bold">u</span>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <nav className="flex flex-col items-center gap-4 py-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="w-full px-4 py-2 flex flex-col items-center text-center hover:bg-white/10"
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs bg-blue-500 px-1.5 rounded-full mt-1">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="w-full">
        <nav className="flex flex-col items-center gap-4 py-4">
          {bottomNavItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="w-full px-4 py-2 flex flex-col items-center text-center hover:bg-white/10"
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <button className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">EK</span>
          </button>
        </div>
      </div>
    </div>
  );
} 