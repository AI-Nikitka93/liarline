import { LiarlineGame } from "../components/LiarlineGame";
import { GameStoreProvider } from "../state/GameStore";

export default function Home() {
  return (
    <GameStoreProvider>
      <LiarlineGame />
    </GameStoreProvider>
  );
}
