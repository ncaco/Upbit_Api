import { Card } from '@/components/ui/card';

export function Settings() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">API 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Access Key</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              placeholder="Access Key를 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secret Key</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded"
              placeholder="Secret Key를 입력하세요"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            저장
          </button>
        </div>
      </Card>
    </div>
  );
} 