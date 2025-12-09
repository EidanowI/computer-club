-- ============================================
-- НЕОБХОДИМЫЕ ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ БД
-- ============================================

-- 1. Индекс для поиска пользователя по логину (очень частый запрос при входе)
-- login уже UNIQUE, но явный индекс улучшит производительность
CREATE INDEX IF NOT EXISTS idx_user_login ON user(login);

-- 2. Индекс для проверки прав администратора (выполняется при каждом запросе)
-- Критически важен для производительности middleware requireAdmin
CREATE INDEX IF NOT EXISTS idx_admin_user_id ON admin(user_id);

-- 3. Индекс для поиска заказов по дате (самый частый запрос в системе)
-- Используется для получения занятых устройств и заказов за дату
CREATE INDEX IF NOT EXISTS idx_order_date ON order_tb(date);

-- 4. Индекс для получения заказов пользователя (частый запрос на странице профиля)
CREATE INDEX IF NOT EXISTS idx_order_user_id ON order_tb(user_id);

-- 5. Составной индекс для поиска занятых устройств по дате и времени
-- Оптимизирует запрос getBusyDevices - самый критичный для производительности
CREATE INDEX IF NOT EXISTS idx_order_date_time ON order_tb(date, time);

-- 6. Индекс для сортировки соревнований по дате (ORDER BY date_time DESC)
CREATE INDEX IF NOT EXISTS idx_competition_date_time ON competition(date_time);

-- 7. Составной индекс для проверки участия команды в соревновании
-- Используется при добавлении команды и проверке победителя
CREATE INDEX IF NOT EXISTS idx_team_competitor_comp_team ON team_competitor(competition_id, team_id);

-- 8. Индекс для получения команды пользователя (частый запрос на странице профиля)
CREATE INDEX IF NOT EXISTS idx_team_user_id ON team(user_id);

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- Эти индексы покрывают самые частые запросы в системе:
-- - Авторизация (user.login, admin.user_id)
-- - Поиск занятых устройств (order_tb.date, order_tb.date+time)
-- - Получение заказов пользователя (order_tb.user_id)
-- - Получение заказов за дату (order_tb.date)
-- - Соревнования (competition.date_time)
-- - Команды (team.user_id, team_competitor)
--
-- Индексы на PRIMARY KEY создаются автоматически, поэтому их не нужно создавать вручную.

