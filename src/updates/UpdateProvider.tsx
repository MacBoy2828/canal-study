import {
  createContext,
  ReactNode,
  useContext,
} from 'react';

import { UpdateModal } from '@/src/components/UpdateModal';
import { useAppUpdate } from '@/src/updates/useAppUpdate';

type UpdateContextValue = ReturnType<typeof useAppUpdate>;

const UpdateContext = createContext<UpdateContextValue | null>(null);

export function UpdateProvider({ children }: { children: ReactNode }) {
  const update = useAppUpdate({ checkOnMount: true });

  return (
    <UpdateContext.Provider value={update}>
      {children}
      <UpdateModal
        visible={update.modalVisible}
        status={update.status}
        latest={update.latest}
        localVersion={update.localVersion}
        error={update.error}
        progress={update.progress}
        onDismiss={update.dismiss}
        onConfirm={() => void update.startUpdate()}
        onRetryCheck={() => void update.checkForUpdate({ interactive: true })}
      />
    </UpdateContext.Provider>
  );
}

export function useUpdate(): UpdateContextValue {
  const value = useContext(UpdateContext);
  if (!value) {
    throw new Error('useUpdate must be used inside UpdateProvider');
  }
  return value;
}
