import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { href: "/", label: "대시보드" },
  { href: "/auto-trading", label: "자동매매" },
  { href: "/assets", label: "자산현황" },
  { href: "/settings", label: "설정" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-white">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link 
                to={item.href}
                className={`block p-2 rounded ${
                  location.pathname === item.href 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 