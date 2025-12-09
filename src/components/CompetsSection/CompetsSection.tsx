import { useState, useEffect } from 'react';
import styles from "./CompetsSection.module.css";

interface Competition {
  id: number;
  award: number;
  date_time: string;
  image_url: string | null;
  teams: string[];
}

interface Team {
  id: number;
  name: string;
}

interface User {
  id: number;
  login: string;
  name: string;
  phone: string;
  isAdmin: boolean;
}

export default function CompetsSection() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Форма создания соревнования
  const [award, setAward] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Форма добавления команды
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [addingTeam, setAddingTeam] = useState(false);
  const [addTeamError, setAddTeamError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitions();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const jsonData = await response.json();
        setUser(jsonData.user);
      }
    } catch (err) {
      console.error('Ошибка получения пользователя:', err);
    }
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/competitions', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки соревнований');
      }
      
      const jsonData = await response.json();
      setCompetitions(jsonData.competitions || []);
    } catch (err) {
      console.error('Ошибка получения соревнований:', err);
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/competitions/teams', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки команд');
      }
      
      const jsonData = await response.json();
      setTeams(jsonData.teams || []);
    } catch (err) {
      console.error('Ошибка получения команд:', err);
      setTeams([]);
    }
  };

  const handleCreateCompetition = async () => {
    if (!award || !dateTime) {
      setError('Призовой фонд и дата обязательны');
      return;
    }

    if (parseFloat(award) <= 0) {
      setError('Призовой фонд должен быть больше 0');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Преобразуем дату в формат YYYY-MM-DD HH:MM:SS
      const formattedDateTime = dateTime.replace('T', ' ') + ':00';
      
      const response = await fetch('http://localhost:5000/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          award: parseFloat(award),
          dateTime: formattedDateTime,
          imageUrl: imageUrl.trim() || null
        })
      });

      const jsonData = await response.json();

      if (!response.ok) {
        throw new Error(jsonData.error || 'Ошибка при создании соревнования');
      }

      setShowCreateModal(false);
      setAward('');
      setDateTime('');
      setImageUrl('');
      fetchCompetitions();
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании соревнования');
    } finally {
      setCreating(false);
    }
  };

  const handleAddTeam = async () => {
    if (!selectedTeamId || !selectedCompetitionId) {
      setAddTeamError('Выберите команду');
      return;
    }

    setAddingTeam(true);
    setAddTeamError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/competitions/${selectedCompetitionId}/teams`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ teamId: parseInt(selectedTeamId) })
        }
      );

      const jsonData = await response.json();

      if (!response.ok) {
        throw new Error(jsonData.error || 'Ошибка при добавлении команды');
      }

      setShowAddTeamModal(false);
      setSelectedTeamId('');
      setSelectedCompetitionId(null);
      fetchCompetitions();
    } catch (err: any) {
      setAddTeamError(err.message || 'Ошибка при добавлении команды');
    } finally {
      setAddingTeam(false);
    }
  };

  const handleOpenAddTeamModal = async (competitionId: number) => {
    setSelectedCompetitionId(competitionId);
    await fetchTeams();
    setShowAddTeamModal(true);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.compets_sec_conteiner}>
      <h2 className={styles.compets_sec_title}>Турниры</h2>
      
      {user?.isAdmin && (
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Создать турнир
        </button>
      )}

      {loading ? (
        <div className={styles.loading}>Загрузка турниров...</div>
      ) : competitions.length === 0 ? (
        <div className={styles.noCompetitions}>Турниров пока нет</div>
      ) : (
        <div className={styles.competitionsList}>
          {competitions.map((competition) => (
            <div key={competition.id} className={styles.competitionCard}>
              {competition.image_url && (
                <img 
                  src={competition.image_url} 
                  alt={`Турнир ${competition.id}`}
                  className={styles.competitionImage}
                />
              )}
              <div className={styles.competitionInfo}>
                <div className={styles.competitionAward}>
                  Призовой фонд: {parseFloat(String(competition.award)).toFixed(2)} руб.
                </div>
                <div className={styles.competitionDateTime}>
                  {formatDateTime(competition.date_time)}
                </div>
                <div className={styles.competitionTeams}>
                  <div className={styles.teamsLabel}>Команды:</div>
                  {competition.teams.length > 0 ? (
                    <div className={styles.teamsList}>
                      {competition.teams.map((team, index) => (
                        <span key={index} className={styles.teamTag}>
                          {team}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noTeams}>Команды не добавлены</div>
                  )}
                </div>
                {user?.isAdmin && (
                  <button
                    className={styles.addTeamButton}
                    onClick={() => handleOpenAddTeamModal(competition.id)}
                  >
                    ➕ Добавить команду
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания соревнования */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => !creating && setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Создать турнир</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Призовой фонд (руб.)</label>
              <input
                type="number"
                className={styles.formInput}
                value={award}
                onChange={(e) => setAward(e.target.value)}
                placeholder="1000"
                min="0.01"
                step="0.01"
                disabled={creating}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Дата и время</label>
              <input
                type="datetime-local"
                className={styles.formInput}
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL изображения (необязательно)</label>
              <input
                type="url"
                className={styles.formInput}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={creating}
              />
            </div>
            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}
            <div className={styles.modalButtons}>
              <button
                className={styles.modalButtonCancel}
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Отмена
              </button>
              <button
                className={styles.modalButtonConfirm}
                onClick={handleCreateCompetition}
                disabled={creating}
              >
                {creating ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления команды */}
      {showAddTeamModal && (
        <div className={styles.modalOverlay} onClick={() => !addingTeam && setShowAddTeamModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Добавить команду</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Выберите команду</label>
              <select
                className={styles.formInput}
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={addingTeam}
              >
                <option value="">-- Выберите команду --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            {addTeamError && (
              <div className={styles.errorMessage}>{addTeamError}</div>
            )}
            <div className={styles.modalButtons}>
              <button
                className={styles.modalButtonCancel}
                onClick={() => setShowAddTeamModal(false)}
                disabled={addingTeam}
              >
                Отмена
              </button>
              <button
                className={styles.modalButtonConfirm}
                onClick={handleAddTeam}
                disabled={addingTeam}
              >
                {addingTeam ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
