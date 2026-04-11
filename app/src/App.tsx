import { GameRoom } from '@/components/GameRoom';
import { UpdateNotification } from '@/components/UpdateNotification';
import { useVersionCheck } from '@/hooks/useVersionCheck';

function App() {
  const { needsUpdate, currentVersion, serverVersion, refreshApp } = useVersionCheck();

  return (
    <>
      <GameRoom />
      {needsUpdate && (
        <UpdateNotification
          currentVersion={currentVersion}
          serverVersion={serverVersion || 'unknown'}
          onRefresh={refreshApp}
        />
      )}
    </>
  );
}

export default App;
