import { useState, useCallback } from 'react';
import { useCreatorStore } from './store/creatorStore';
import LakeListView from './components/LakeListView';
import CreatorLayout from './components/creator/CreatorLayout';
import PlayerView from './components/player/PlayerView';

type ViewState = 'list' | 'creator' | 'player';

export default function InteractiveDramaPage() {
  const [view, setView] = useState<ViewState>('list');
  const [activeLakeId, setActiveLakeId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setView('creator');
    setActiveLakeId(null);
  }, []);

  const handleEdit = useCallback((lakeId: string) => {
    setActiveLakeId(lakeId);
    setView('creator');
  }, []);

  const handlePlay = useCallback((lakeId: string) => {
    setActiveLakeId(lakeId);
    setView('player');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setActiveLakeId(null);
  }, []);

  const handleBackToCreator = useCallback(() => {
    setView('creator');
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      {view === 'list' && (
        <LakeListView
          onCreate={handleCreate}
          onEdit={handleEdit}
          onPlay={handlePlay}
        />
      )}
      {view === 'creator' && (
        <CreatorLayout
          lakeId={activeLakeId}
          onBack={handleBack}
          onPlay={handlePlay}
        />
      )}
      {view === 'player' && activeLakeId && (
        <PlayerView
          lakeId={activeLakeId}
          onBack={handleBackToCreator}
          onBackToList={handleBack}
        />
      )}
    </div>
  );
}
