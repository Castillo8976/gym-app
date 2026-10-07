import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from './src/api';

const TOKEN_KEY = 'gym-app-session-token';
const COLORS = {
  ink: '#24142F',
  muted: '#6A5A7A',
  paper: '#F7F3FF',
  white: '#FFFFFF',
  line: '#E5D9F8',
  purple: '#8B5CF6',
  deepPurple: '#4C1D95',
  violet: '#A78BFA',
  palePurple: '#EFE9FF',
  lavender: '#F3E8FF',
  error: '#A13C7F',
};

function formatDate(value) {
  if (!value) return '';
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDecimal(value) {
  return Number(String(value).replace(',', '.'));
}

const SET_TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'warmup', label: 'Calent.' },
  { value: 'failure', label: 'Fallo' },
  { value: 'drop_set', label: 'Drop' },
];

const DEFAULT_PLATES = [2.5, 5, 10, 20, 25, 45];

function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        keyboardType={keyboardType || 'default'}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#909991"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, loading }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        (disabled || loading) && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      {loading ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('train');
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('female');
  const [bodyweight, setBodyweight] = useState('');
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [records, setRecords] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [profileWeight, setProfileWeight] = useState('');
  const [showLeagueBuilder, setShowLeagueBuilder] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueStart, setLeagueStart] = useState(getLocalDate());
  const [leagueEnd, setLeagueEnd] = useState('');
  const [leagueDetail, setLeagueDetail] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [setType, setSetType] = useState('normal');
  const [restSeconds, setRestSeconds] = useState('90');
  const [actualRestSeconds, setActualRestSeconds] = useState('');
  const [setNotes, setSetNotes] = useState('');
  const [setCount, setSetCount] = useState(0);
  const [showExercises, setShowExercises] = useState(false);
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [showRoutineExercisePicker, setShowRoutineExercisePicker] = useState(false);
  const [routinePickIndex, setRoutinePickIndex] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineType, setRoutineType] = useState('single');
  const [routineExercises, setRoutineExercises] = useState([]);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [lastSets, setLastSets] = useState([]);
  const [restPreferences, setRestPreferences] = useState({ defaultRestSeconds: 90, defaultWarmupRestSeconds: 60 });
  const [plateConfig, setPlateConfig] = useState(DEFAULT_PLATES);
  const [plateSuggestion, setPlateSuggestion] = useState(null);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [restActive, setRestActive] = useState(false);

  const selectedExerciseReference = lastSets.find((entry) => entry.exerciseId === selectedExercise?.id) || null;

  async function loadData(authToken) {
    const [exerciseList, history, restPrefs, plates, lastReferenceSets, routineList, rankList, recordList, leagueList] = await Promise.all([
      api.getExercises(),
      api.getSessions(authToken),
      api.getRestPreferences(authToken),
      api.getPlateConfig(authToken).catch(() => ({ plates: DEFAULT_PLATES })),
      api.getLastSets(authToken).catch(() => []),
      api.getRoutines(authToken).catch(() => []),
      api.getRanks(authToken).catch(() => []),
      api.getRecords(authToken).catch(() => []),
      api.getLeagues(authToken).catch(() => []),
    ]);
    setExercises(exerciseList);
    setSessions(history);
    setRestPreferences(restPrefs || { defaultRestSeconds: 90, defaultWarmupRestSeconds: 60 });
    setPlateConfig(plates?.plates || DEFAULT_PLATES);
    setLastSets(lastReferenceSets || []);
    setRoutines(routineList || []);
    setRanks(rankList || []);
    setRecords(recordList || []);
    setLeagues(leagueList || []);
  }

  useEffect(() => {
    setProfileName(user?.name || '');
    setProfileWeight(user?.bodyweightKg !== undefined && user?.bodyweightKg !== null ? String(user.bodyweightKg) : '');
  }, [user]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!savedToken) return;
        const profile = await api.getProfile(savedToken);
        setToken(savedToken);
        setUser(profile);
        await loadData(savedToken);
      } catch (error) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setNotice(error.message);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    if (!selectedExercise || !weight || !token) {
      setPlateSuggestion(null);
      return;
    }

    const targetWeight = parseDecimal(weight);
    if (!Number.isFinite(targetWeight) || targetWeight <= 0) {
      setPlateSuggestion(null);
      return;
    }

    api.suggestPlates(token, { targetWeightKg: targetWeight })
      .then((result) => setPlateSuggestion(result))
      .catch(() => setPlateSuggestion(null));
  }, [selectedExercise, token, weight]);

  useEffect(() => {
    if (!restActive || restSecondsLeft <= 0) {
      if (restActive && restSecondsLeft <= 0) {
        setRestActive(false);
        setNotice('Descanso finalizado.');
      }
      return;
    }

    const timer = setInterval(() => {
      setRestSecondsLeft((current) => {
        if (current <= 1) return 0;
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restActive, restSecondsLeft]);

  useEffect(() => {
    const preferredRest = setType === 'warmup'
      ? (restPreferences.defaultWarmupRestSeconds ?? 60)
      : (restPreferences.defaultRestSeconds ?? 90);
    setRestSeconds(String(preferredRest));
  }, [setType, restPreferences]);

  async function handleAuth() {
    setBusy(true);
    setNotice('');
    try {
      if (authMode === 'register') {
        await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          gender,
          bodyweightKg: parseDecimal(bodyweight),
        });
      }
      const result = await api.login({ email: email.trim(), password });
      await SecureStore.setItemAsync(TOKEN_KEY, result.token);
      const [profile, exerciseList, history, restPrefs, plates, lastReferenceSets, routineList, rankList, recordList, leagueList] = await Promise.all([
        api.getProfile(result.token),
        api.getExercises(),
        api.getSessions(result.token),
        api.getRestPreferences(result.token),
        api.getPlateConfig(result.token).catch(() => ({ plates: DEFAULT_PLATES })),
        api.getLastSets(result.token).catch(() => []),
        api.getRoutines(result.token).catch(() => []),
        api.getRanks(result.token).catch(() => []),
        api.getRecords(result.token).catch(() => []),
        api.getLeagues(result.token).catch(() => []),
      ]);
      setToken(result.token);
      setUser(profile);
      setExercises(exerciseList);
      setSessions(history);
      setRestPreferences(restPrefs || { defaultRestSeconds: 90, defaultWarmupRestSeconds: 60 });
      setPlateConfig(plates?.plates || DEFAULT_PLATES);
      setLastSets(lastReferenceSets || []);
      setRoutines(routineList || []);
      setRanks(rankList || []);
      setRecords(recordList || []);
      setLeagues(leagueList || []);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProfile() {
    if (!token) return;
    setBusy(true);
    setNotice('');
    try {
      const bodyweightKg = parseDecimal(profileWeight);
      if (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0) {
        throw new Error('El peso corporal debe ser un número válido y mayor que 0.');
      }
      const updated = await api.updateProfile(token, {
        name: profileName.trim(),
        bodyweightKg,
      });
      setUser((current) => ({ ...(current || {}), ...updated }));
      setNotice('Perfil actualizado.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStartSession() {
    setBusy(true);
    setNotice('');
    try {
      const created = await api.createSession(token, {
        sessionDate: getLocalDate(),
      });
      setActiveSession(created);
      setSetCount(0);
      setType('normal');
      setRestSeconds(String(restPreferences.defaultRestSeconds || 90));
      setActualRestSeconds('');
      setSetNotes('');
      setRestActive(false);
      setNotice('Sesión iniciada. Añade tus series.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddSet() {
    if (!activeSession || !selectedExercise) {
      setNotice('Elige un ejercicio para registrar la serie.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const payload = {
        exerciseId: selectedExercise.id,
        weightKg: parseDecimal(weight),
        reps: Number(reps),
        setOrder: setCount + 1,
        setType,
        notes: setNotes.trim() || undefined,
      };
      const requestedRest = Number(restSeconds || 0);
      const actualRest = Number(actualRestSeconds || 0);
      if (requestedRest > 0) payload.restSeconds = requestedRest;
      if (actualRest > 0) payload.actualRestSeconds = actualRest;

      await api.addSet(token, activeSession.id, payload);
      setSetCount((count) => count + 1);
      setReps('');
      setActualRestSeconds('');
      setSetNotes('');
      const nextRest = Number(restSeconds || restPreferences.defaultRestSeconds || 90);
      setRestSecondsLeft(nextRest);
      setRestActive(true);
      setNotice('Serie guardada.');
      const history = await api.getSessions(token);
      const nextLastSets = await api.getLastSets(token).catch(() => []);
      setSessions(history);
      setLastSets(nextLastSets);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFinishSession() {
    setActiveSession(null);
    setSelectedExercise(null);
    setSetCount(0);
    setType('normal');
    setRestSeconds(String(restPreferences.defaultRestSeconds || 90));
    setActualRestSeconds('');
    setSetNotes('');
    setRestActive(false);
    setNotice('Entrenamiento guardado en tu historial.');
    try {
      setSessions(await api.getSessions(token));
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function reloadLeagues() {
    if (!token) return;
    try {
      const leagueList = await api.getLeagues(token).catch(() => []);
      setLeagues(leagueList || []);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function handleCreateLeague() {
    if (!leagueName.trim()) {
      setNotice('Pon un nombre para la liga.');
      return;
    }
    if (!leagueStart || !leagueEnd) {
      setNotice('Define la fecha de inicio y fin de la temporada.');
      return;
    }

    setBusy(true);
    setNotice('');
    try {
      await api.createLeague(token, {
        name: leagueName.trim(),
        seasonStart: leagueStart,
        seasonEnd: leagueEnd,
      });
      setShowLeagueBuilder(false);
      setLeagueName('');
      setLeagueStart(getLocalDate());
      setLeagueEnd('');
      await reloadLeagues();
      setNotice('Liga creada correctamente.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoinLeague(leagueId) {
    setBusy(true);
    setNotice('');
    try {
      await api.joinLeague(token, leagueId);
      await reloadLeagues();
      setNotice('Te has unido a la liga.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function openLeagueDetail(league) {
    setBusy(true);
    setNotice('');
    try {
      const members = await api.getLeagueMembers(token, league.id);
      setLeagueDetail({ league, members });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSet(setId) {
    if (!sessionDetail?.id || !setId) return;
    setBusy(true);
    setNotice('');
    try {
      await api.deleteSet(token, sessionDetail.id, setId);
      const nextSession = await api.getSession(token, sessionDetail.id);
      setSessionDetail(nextSession);
      setSessions(await api.getSessions(token));
      setNotice('Serie eliminada y PRs recalculados.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  function resetRoutineBuilder() {
    setRoutineName('');
    setRoutineDescription('');
    setRoutineType('single');
    setRoutineExercises([]);
  }

  function openRoutineBuilder() {
    if (!exercises.length) {
      setNotice('Primero carga el catálogo de ejercicios.');
      return;
    }

    const firstExercise = exercises[0];
    resetRoutineBuilder();
    setRoutineExercises([
      {
        exerciseId: firstExercise.id,
        exerciseName: firstExercise.name,
        targetSets: '4',
        targetReps: '8',
        targetWeightKg: '0',
        restSeconds: '90',
        grouping: 'main',
      },
    ]);
    setShowRoutineBuilder(true);
  }

  function addRoutineExercise() {
    if (!exercises.length) {
      setNotice('No hay ejercicios disponibles para añadir a la rutina.');
      return;
    }

    const nextExercise = exercises[routineExercises.length % exercises.length] || exercises[0];
    setRoutineExercises((current) => [
      ...current,
      {
        exerciseId: nextExercise.id,
        exerciseName: nextExercise.name,
        targetSets: '3',
        targetReps: '8',
        targetWeightKg: '0',
        restSeconds: '90',
        grouping: 'main',
      },
    ]);
  }

  function updateRoutineExercise(index, updates) {
    setRoutineExercises((current) => current.map((item, currentIndex) => (
      currentIndex === index ? { ...item, ...updates } : item
    )));
  }

  async function handleCreateRoutine() {
    if (!routineName.trim()) {
      setNotice('Pon un nombre para la rutina.');
      return;
    }
    if (routineExercises.length === 0) {
      setNotice('La rutina debe incluir al menos un ejercicio.');
      return;
    }

    setBusy(true);
    setNotice('');
    try {
      const payload = {
        name: routineName.trim(),
        description: routineDescription.trim(),
        routineType,
        exercises: routineExercises.map((row, index) => ({
          exerciseId: row.exerciseId,
          position: index + 1,
          targetSets: Number(row.targetSets || 0),
          targetReps: Number(row.targetReps || 0),
          targetWeightKg: parseDecimal(row.targetWeightKg || '0'),
          restSeconds: Number(row.restSeconds || 0),
          grouping: row.grouping || 'main',
        })),
      };

      await api.createRoutine(token, payload);
      setShowRoutineBuilder(false);
      resetRoutineBuilder();
      setRoutines(await api.getRoutines(token).catch(() => []));
      setNotice('Rutina creada correctamente.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleApplyRoutine(routine) {
    if (!routine || !token) return;
    setBusy(true);
    setNotice('');
    try {
      const created = await api.applyRoutine(token, routine.id, {
        sessionDate: getLocalDate(),
        notes: `Rutina aplicada: ${routine.name}`,
      });
      setActiveSession(created.session);
      setSetCount(created.createdSets || 0);
      setNotice(`Rutina "${routine.name}" aplicada.`);
      setSessions(await api.getSessions(token));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function openSession(session) {
    setBusy(true);
    setNotice('');
    try {
      setSessionDetail(await api.getSession(token, session.id));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setActiveSession(null);
    setSessions([]);
    setExercises([]);
    setNotice('');
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.deepPurple} size="large" />
      </SafeAreaView>
    );
  }

  if (!token) {
    const registering = authMode === 'register';
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.brandLine}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>G</Text></View>
              <Text style={styles.brandName}>FORMA / TRAINING LOG</Text>
            </View>
            <View style={styles.authHeadingWrap}>
              <Text style={styles.eyebrow}>FUERZA, SESIÓN A SESIÓN</Text>
              <Text style={styles.authHeading}>{registering ? 'Crea tu cuenta.' : 'Vuelve al trabajo.'}</Text>
              <Text style={styles.bodyCopy}>Registra tus levantamientos y consulta cada sesión desde un mismo lugar.</Text>
            </View>
            <View style={styles.authForm}>
              {registering && <Field label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />}
              <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="nombre@correo.com" keyboardType="email-address" />
              <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secureTextEntry />
              {registering && (
                <>
                  <Text style={styles.fieldLabel}>Género del perfil</Text>
                  <View style={styles.segmentRow}>
                    {[
                      { value: 'female', label: 'Mujer' },
                      { value: 'male', label: 'Hombre' },
                    ].map((option) => (
                      <Pressable key={option.value} onPress={() => setGender(option.value)} style={[styles.segment, gender === option.value && styles.segmentActive]}>
                        <Text style={[styles.segmentText, gender === option.value && styles.segmentTextActive]}>{option.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Field label="Peso corporal (kg)" value={bodyweight} onChangeText={setBodyweight} placeholder="Ej. 68.5" keyboardType="decimal-pad" />
                </>
              )}
              {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
              <PrimaryButton disabled={registering && (!name.trim() || !bodyweight)} label={registering ? 'Crear cuenta' : 'Iniciar sesión'} loading={busy} onPress={handleAuth} />
              <Pressable onPress={() => { setAuthMode(registering ? 'login' : 'register'); setNotice(''); }} style={styles.authSwitch}>
                <Text style={styles.authSwitchText}>{registering ? 'Ya tengo cuenta' : 'Crear una cuenta'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const detailSets = sessionDetail?.WorkoutSets || sessionDetail?.workoutSets || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.brandLine}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>G</Text></View>
          <Text style={styles.brandName}>FORMA</Text>
        </View>
        <Pressable accessibilityLabel="Cerrar sesión" onPress={handleLogout} style={styles.avatarButton}>
          <Text style={styles.avatarText}>{(user?.name || 'U').slice(0, 1).toUpperCase()}</Text>
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        <Pressable onPress={() => setTab('train')} style={[styles.tab, tab === 'train' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'train' && styles.tabTextActive]}>Entrenar</Text>
        </Pressable>
        <Pressable onPress={() => { setTab('history'); setActiveSession(null); }} style={[styles.tab, tab === 'history' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Historial</Text>
        </Pressable>
        <Pressable onPress={() => setTab('profile')} style={[styles.tab, tab === 'profile' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'profile' && styles.tabTextActive]}>Perfil</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
        {tab === 'train' ? (
          <>
            <View style={styles.pageHeading}>
              <Text style={styles.eyebrow}>{formatDate(new Date().toISOString().slice(0, 10)).toUpperCase()}</Text>
              <Text style={styles.pageTitle}>{activeSession ? 'En marcha.' : 'A entrenar.'}</Text>
              <Text style={styles.bodyCopy}>{activeSession ? 'Guarda cada serie mientras avanzas.' : `Buen trabajo, ${user?.name?.split(' ')[0] || 'atleta'}. Registra tu próxima sesión.`}</Text>
            </View>

            {!activeSession ? (
              <View style={styles.startPanel}>
                <View style={styles.startPanelText}>
                  <Text style={styles.panelKicker}>NUEVO REGISTRO</Text>
                  <Text style={styles.panelTitle}>Una sesión, un paso más.</Text>
                  <Text style={styles.panelBody}>Tu entrenamiento quedará en el historial con fecha y detalle de series.</Text>
                </View>
                <PrimaryButton label="Empezar entrenamiento" loading={busy} onPress={handleStartSession} />
                <PrimaryButton label="Crear rutina" loading={busy} onPress={openRoutineBuilder} />
              </View>
            ) : (
              <View style={styles.workoutPanel}>
                <View style={styles.sessionMeta}>
                  <View>
                    <Text style={styles.panelKicker}>SESIÓN ACTIVA</Text>
                    <Text style={styles.panelTitle}>{formatDate(activeSession.sessionDate)}</Text>
                  </View>
                  <View style={styles.counterBadge}><Text style={styles.counterNumber}>{setCount}</Text><Text style={styles.counterCaption}>SERIES</Text></View>
                </View>
                <Text style={styles.fieldLabel}>Ejercicio</Text>
                <Pressable accessibilityRole="button" onPress={() => setShowExercises(true)} style={styles.selectorButton}>
                  <Text style={[styles.selectorText, !selectedExercise && styles.placeholder]}>{selectedExercise?.name || 'Seleccionar del catálogo'}</Text>
                  <Text style={styles.selectorArrow}>⌄</Text>
                </Pressable>
                <View style={styles.measureRow}>
                  <View style={styles.measureField}>
                    <Field label="Carga (kg)" value={weight} onChangeText={setWeight} placeholder="0.0" keyboardType="decimal-pad" />
                  </View>
                  <View style={styles.measureField}>
                    <Field label="Repeticiones" value={reps} onChangeText={setReps} placeholder="0" keyboardType="number-pad" />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Tipo de serie</Text>
                <View style={styles.segmentRow}>
                  {SET_TYPE_OPTIONS.map((option) => (
                    <Pressable key={option.value} onPress={() => setSetType(option.value)} style={[styles.segment, setType === option.value && styles.segmentActive]}>
                      <Text style={[styles.segmentText, setType === option.value && styles.segmentTextActive]}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.measureRow}>
                  <View style={styles.measureField}>
                    <Field label="Descanso (s)" value={restSeconds} onChangeText={setRestSeconds} placeholder="90" keyboardType="number-pad" />
                  </View>
                  <View style={styles.measureField}>
                    <Field label="Descanso real (s)" value={actualRestSeconds} onChangeText={setActualRestSeconds} placeholder="0" keyboardType="number-pad" />
                  </View>
                </View>

                {restActive && (
                  <View style={styles.timerCard}>
                    <Text style={styles.panelKicker}>DESCANSO</Text>
                    <Text style={styles.timerText}>{restSecondsLeft}s</Text>
                    <Pressable onPress={() => setRestActive(false)} style={styles.timerButton}>
                      <Text style={styles.timerButtonText}>Parar</Text>
                    </Pressable>
                  </View>
                )}

                {selectedExerciseReference && (
                  <View style={styles.referenceCard}>
                    <Text style={styles.panelKicker}>ÚLTIMO REGISTRO</Text>
                    <Text style={styles.referenceTitle}>{selectedExerciseReference.exerciseName}</Text>
                    <Text style={styles.referenceText}>{Number(selectedExerciseReference.weightKg).toLocaleString('es')} kg × {selectedExerciseReference.reps} · {selectedExerciseReference.setType === 'drop_set' ? 'Drop set' : selectedExerciseReference.setType === 'warmup' ? 'Calentamiento' : selectedExerciseReference.setType === 'failure' ? 'Fallo' : 'Normal'}</Text>
                  </View>
                )}

                {plateSuggestion && (
                  <View style={styles.referenceCard}>
                    <Text style={styles.panelKicker}>DISCOS SUGERIDOS</Text>
                    <Text style={styles.referenceTitle}>{plateSuggestion.totalWeightKg} kg</Text>
                    <Text style={styles.referenceText}>{plateSuggestion.stacks.map((item) => `${item.count}×${item.plateKg}kg`).join(' + ') || 'Sin combinación exacta'}</Text>
                  </View>
                )}

                <Field label="Notas" value={setNotes} onChangeText={setSetNotes} placeholder="Comentarios de la serie" keyboardType="default" />

                {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
                <PrimaryButton disabled={!selectedExercise || !weight || !reps} label="Guardar serie" loading={busy} onPress={handleAddSet} />
                {setCount > 0 && (
                  <Pressable onPress={handleFinishSession} style={styles.finishButton}>
                    <Text style={styles.finishButtonText}>Finalizar entrenamiento</Text>
                  </Pressable>
                )}
              </View>
            )}

            {ranks.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>Rangos</Text></View>
                {ranks.map((rank) => (
                  <View key={rank.id} style={styles.routineCard}>
                    <Text style={styles.exerciseName}>{rank.MuscleGroup?.name || 'Grupo muscular'}</Text>
                    <Text style={styles.bodyCopy}>Nivel actual: {rank.currentRank}</Text>
                  </View>
                ))}
              </View>
            )}

            {records.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>PRs</Text></View>
                {records.slice(0, 3).map((record) => (
                  <View key={record.id} style={styles.routineCard}>
                    <Text style={styles.exerciseName}>{record.Exercise?.name || 'Ejercicio'}</Text>
                    <Text style={styles.bodyCopy}>1RM estimado: {Number(record.estimated1rm).toLocaleString('es', { maximumFractionDigits: 2 })} kg</Text>
                  </View>
                ))}
              </View>
            )}

            {leagues.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}>
                  <Text style={styles.sectionTitle}>Ligas</Text>
                  <Pressable onPress={() => setShowLeagueBuilder(true)}><Text style={styles.linkText}>Crear</Text></Pressable>
                </View>
                {leagues.map((league) => (
                  <View key={league.id} style={styles.routineCard}>
                    <View style={styles.sectionHeadingRow}>
                      <View style={styles.flex}>
                        <Text style={styles.exerciseName}>{league.name}</Text>
                        <Text style={styles.bodyCopy}>{league.memberCount} participantes · {league.isJoined ? 'Inscrito' : 'Abierta'} · {formatDate(league.seasonStart)} - {formatDate(league.seasonEnd)}</Text>
                      </View>
                    </View>
                    <View style={styles.measureRow}>
                      {!league.isJoined ? (
                        <Pressable onPress={() => handleJoinLeague(league.id)} style={styles.primaryButtonSecondary}><Text style={styles.primaryButtonText}>Unirse</Text></Pressable>
                      ) : (
                        <Pressable onPress={() => openLeagueDetail(league)} style={styles.primaryButtonSecondary}><Text style={styles.primaryButtonText}>Ver ranking</Text></Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {routines.length > 0 && !activeSession && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>Rutinas guardadas</Text></View>
                {routines.map((routine) => (
                  <View key={routine.id} style={styles.routineCard}>
                    <View style={styles.sectionHeadingRow}>
                      <View style={styles.flex}>
                        <Text style={styles.exerciseName}>{routine.name}</Text>
                        <Text style={styles.exerciseGroup}>{routine.routineType === 'superset' ? 'Superserie' : routine.routineType === 'circuit' ? 'Circuito' : 'Simple'}</Text>
                      </View>
                      <Pressable onPress={() => handleApplyRoutine(routine)}><Text style={styles.linkText}>Usar</Text></Pressable>
                    </View>
                    {!!routine.description && <Text style={styles.bodyCopy}>{routine.description}</Text>}
                    <View style={styles.routineList}>
                      {(routine.WorkoutTemplateExercises || []).map((entry) => (
                        <Text key={`${routine.id}-${entry.id}`} style={styles.routineItem}>{entry.position}. {entry.Exercise?.name || 'Ejercicio'} · {entry.targetSets}×{entry.targetReps} · {entry.targetWeightKg} kg</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {!activeSession && sessions.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>Último entrenamiento</Text><Pressable onPress={() => setTab('history')}><Text style={styles.linkText}>Ver historial</Text></Pressable></View>
                <SessionRow session={sessions[0]} onPress={() => openSession(sessions[0])} />
              </View>
            )}
          </>
        ) : tab === 'profile' ? (
          <>
            <View style={styles.pageHeading}>
              <Text style={styles.eyebrow}>TU PERFIL</Text>
              <Text style={styles.pageTitle}>{user?.name || 'Atleta'}</Text>
              <Text style={styles.bodyCopy}>Actualiza tu peso corporal y revisa tu progreso.</Text>
            </View>

            <View style={styles.startPanel}>
              <View style={styles.startPanelText}>
                <Text style={styles.panelKicker}>RESUMEN</Text>
                <Text style={styles.panelTitle}>{Number(user?.bodyweightKg || 0).toLocaleString('es', { maximumFractionDigits: 2 })} kg</Text>
                <Text style={styles.panelBody}>{user?.gender === 'female' ? 'Perfil femenino' : 'Perfil masculino'} · {ranks.length} rangos activos</Text>
              </View>
            </View>

            <View style={styles.workoutPanel}>
              <Field label="Nombre" value={profileName} onChangeText={setProfileName} placeholder="Tu nombre" keyboardType="default" />
              <Field label="Peso corporal (kg)" value={profileWeight} onChangeText={setProfileWeight} placeholder="Ej. 68.5" keyboardType="decimal-pad" />
              {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
              <PrimaryButton label="Guardar cambios" loading={busy} onPress={handleSaveProfile} />
            </View>

            {ranks.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>Rangos</Text></View>
                {ranks.map((rank) => (
                  <View key={rank.id} style={styles.routineCard}>
                    <Text style={styles.exerciseName}>{rank.MuscleGroup?.name || 'Grupo muscular'}</Text>
                    <Text style={styles.bodyCopy}>Nivel actual: {rank.currentRank || rank.rankLevel || 'Sin nivel'}</Text>
                  </View>
                ))}
              </View>
            )}

            {records.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>PRs</Text></View>
                {records.slice(0, 3).map((record) => (
                  <View key={record.id} style={styles.routineCard}>
                    <Text style={styles.exerciseName}>{record.Exercise?.name || 'Ejercicio'}</Text>
                    <Text style={styles.bodyCopy}>1RM estimado: {Number(record.estimated1rm || 0).toLocaleString('es', { maximumFractionDigits: 2 })} kg</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.pageHeading}>
              <Text style={styles.eyebrow}>TU REGISTRO</Text>
              <Text style={styles.pageTitle}>Historial.</Text>
              <Text style={styles.bodyCopy}>Sesiones guardadas con sus series y repeticiones.</Text>
            </View>
            {busy && <ActivityIndicator color={COLORS.deepPurple} style={styles.inlineLoader} />}
            {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
            {sessions.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyMark}>—</Text><Text style={styles.emptyTitle}>Todavía no hay sesiones</Text><Text style={styles.bodyCopy}>Tu primer entrenamiento aparecerá aquí.</Text><PrimaryButton label="Empezar entrenamiento" onPress={() => { setTab('train'); }} /></View>
            ) : sessions.map((session) => <SessionRow key={session.id} session={session} onPress={() => openSession(session)} />)}
          </>
        )}
        <Text style={styles.footerNote}>Carga en kg, descanso configurable y cálculo de discos integrado en el registro de series.</Text>
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setShowExercises(false)} transparent visible={showExercises}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exerciseSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeadingRow}>
              <View><Text style={styles.eyebrow}>CATÁLOGO</Text><Text style={styles.sheetTitle}>Elige ejercicio</Text></View>
              <Pressable accessibilityLabel="Cerrar catálogo" onPress={() => setShowExercises(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.exerciseList}>
              {exercises.map((exercise) => (
                <Pressable key={exercise.id} onPress={() => { setSelectedExercise(exercise); setShowExercises(false); }} style={styles.exerciseOption}>
                  <View style={styles.exerciseDot}><Text style={styles.exerciseDotText}>{exercise.name.slice(0, 1)}</Text></View>
                  <View style={styles.flex}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseGroup}>{exercise.MuscleGroup?.name || exercise.MuscleGroup?.Name || 'Ejercicio'}</Text></View>
                  <Text style={styles.optionArrow}>›</Text>
                </Pressable>
              ))}
              {exercises.length === 0 && <Text style={styles.bodyCopy}>El catálogo está vacío. Carga los ejercicios base desde el backend.</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setShowRoutineBuilder(false)} transparent visible={showRoutineBuilder}>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeadingRow}>
              <View><Text style={styles.eyebrow}>RUTINA</Text><Text style={styles.sheetTitle}>Crear plantilla</Text></View>
              <Pressable accessibilityLabel="Cerrar rutina" onPress={() => { setShowRoutineBuilder(false); resetRoutineBuilder(); }} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.exerciseList}>
              <Field label="Nombre" value={routineName} onChangeText={setRoutineName} placeholder="Ej. Empuje clásico" keyboardType="default" />
              <Field label="Descripción" value={routineDescription} onChangeText={setRoutineDescription} placeholder="Opcional" keyboardType="default" />

              <Text style={styles.fieldLabel}>Tipo de rutina</Text>
              <View style={styles.segmentRow}>
                {['single', 'superset', 'circuit'].map((option) => (
                  <Pressable key={option} onPress={() => setRoutineType(option)} style={[styles.segment, routineType === option && styles.segmentActive]}>
                    <Text style={[styles.segmentText, routineType === option && styles.segmentTextActive]}>{option === 'single' ? 'Simple' : option === 'superset' ? 'Superserie' : 'Circuito'}</Text>
                  </Pressable>
                ))}
              </View>

              {routineExercises.map((entry, index) => (
                <View key={`${entry.exerciseId}-${index}`} style={styles.routineEditorRow}>
                  <Pressable onPress={() => { setRoutinePickIndex(index); setShowRoutineExercisePicker(true); }} style={styles.routineExerciseSelector}>
                    <Text style={styles.exerciseName}>{entry.exerciseName}</Text>
                  </Pressable>
                  <View style={styles.measureRow}>
                    <View style={styles.measureField}>
                      <Field label="Series" value={String(entry.targetSets)} onChangeText={(value) => updateRoutineExercise(index, { targetSets: value })} placeholder="4" keyboardType="number-pad" />
                    </View>
                    <View style={styles.measureField}>
                      <Field label="Reps" value={String(entry.targetReps)} onChangeText={(value) => updateRoutineExercise(index, { targetReps: value })} placeholder="8" keyboardType="number-pad" />
                    </View>
                  </View>
                  <View style={styles.measureRow}>
                    <View style={styles.measureField}>
                      <Field label="Peso" value={String(entry.targetWeightKg)} onChangeText={(value) => updateRoutineExercise(index, { targetWeightKg: value })} placeholder="0" keyboardType="decimal-pad" />
                    </View>
                    <View style={styles.measureField}>
                      <Field label="Descanso" value={String(entry.restSeconds)} onChangeText={(value) => updateRoutineExercise(index, { restSeconds: value })} placeholder="90" keyboardType="number-pad" />
                    </View>
                  </View>
                  <View style={styles.segmentRow}>
                    {['main', 'paired', 'circuit'].map((group) => (
                      <Pressable key={group} onPress={() => updateRoutineExercise(index, { grouping: group })} style={[styles.segment, entry.grouping === group && styles.segmentActive]}>
                        <Text style={[styles.segmentText, entry.grouping === group && styles.segmentTextActive]}>{group === 'main' ? 'Main' : group === 'paired' ? 'Par' : 'Circuit'}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}

              <Pressable onPress={addRoutineExercise} style={styles.primaryButtonSecondary}>
                <Text style={styles.primaryButtonText}>Añadir ejercicio</Text>
              </Pressable>
              {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
              <PrimaryButton label="Guardar rutina" loading={busy} onPress={handleCreateRoutine} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setShowRoutineExercisePicker(false)} transparent visible={showRoutineExercisePicker}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exerciseSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeadingRow}>
              <View><Text style={styles.eyebrow}>EJERCICIO</Text><Text style={styles.sheetTitle}>Elegir ejercicio</Text></View>
              <Pressable accessibilityLabel="Cerrar selector de ejercicio" onPress={() => setShowRoutineExercisePicker(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.exerciseList}>
              {exercises.map((exercise) => (
                <Pressable key={exercise.id} onPress={() => {
                  if (routinePickIndex !== null) {
                    updateRoutineExercise(routinePickIndex, {
                      exerciseId: exercise.id,
                      exerciseName: exercise.name,
                    });
                  }
                  setShowRoutineExercisePicker(false);
                }} style={styles.exerciseOption}>
                  <View style={styles.exerciseDot}><Text style={styles.exerciseDotText}>{exercise.name.slice(0, 1)}</Text></View>
                  <View style={styles.flex}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseGroup}>{exercise.MuscleGroup?.name || exercise.MuscleGroup?.Name || 'Ejercicio'}</Text></View>
                  <Text style={styles.optionArrow}>›</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setShowLeagueBuilder(false)} transparent visible={showLeagueBuilder}>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeadingRow}>
              <View><Text style={styles.eyebrow}>LIGA</Text><Text style={styles.sheetTitle}>Crear temporada</Text></View>
              <Pressable accessibilityLabel="Cerrar liga" onPress={() => setShowLeagueBuilder(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.exerciseList}>
              <Field label="Nombre de la liga" value={leagueName} onChangeText={setLeagueName} placeholder="Ej. Liga Octubre" keyboardType="default" />
              <Field label="Fecha inicio" value={leagueStart} onChangeText={setLeagueStart} placeholder="YYYY-MM-DD" keyboardType="default" />
              <Field label="Fecha fin" value={leagueEnd} onChangeText={setLeagueEnd} placeholder="YYYY-MM-DD" keyboardType="default" />
              {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
              <PrimaryButton label="Guardar liga" loading={busy} onPress={handleCreateLeague} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setLeagueDetail(null)} transparent visible={!!leagueDetail}>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeadingRow}>
              <View><Text style={styles.eyebrow}>RANKING</Text><Text style={styles.sheetTitle}>{leagueDetail?.league?.name || 'Liga'}</Text></View>
              <Pressable accessibilityLabel="Cerrar ranking" onPress={() => setLeagueDetail(null)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.exerciseList}>
              {(leagueDetail?.members || []).map((member, index) => (
                <View key={member.id || `${member.userId}-${index}`} style={styles.detailSetRow}>
                  <Text style={styles.detailMeasure}>#{index + 1}</Text>
                  <View style={styles.flex}><Text style={styles.exerciseName}>{member.user?.name || member.User?.name || 'Usuario'}</Text><Text style={styles.exerciseGroup}>{Number(member.totalVolumeKg || 0).toLocaleString('es', { maximumFractionDigits: 2 })} kg</Text></View>
                </View>
              ))}
              {(!leagueDetail?.members || leagueDetail.members.length === 0) && <Text style={styles.bodyCopy}>Todavía no hay participantes en esta liga.</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setSessionDetail(null)} transparent visible={!!sessionDetail}>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sectionHeadingRow}>
              <View><Text style={styles.eyebrow}>ENTRENAMIENTO</Text><Text style={styles.sheetTitle}>{formatDate(sessionDetail?.sessionDate)}</Text></View>
              <Pressable accessibilityLabel="Cerrar detalle" onPress={() => setSessionDetail(null)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.exerciseList}>
              {detailSets.map((set) => (
                <View key={set.id} style={styles.detailSetRow}>
                  <View style={styles.flex}><Text style={styles.exerciseName}>{set.Exercise?.name || set.exercise?.name || 'Ejercicio'}</Text><Text style={styles.exerciseGroup}>Serie {set.setOrder}</Text></View>
                  <Text style={styles.detailMeasure}>{Number(set.weightKg).toLocaleString('es')} kg</Text>
                  <Text style={styles.detailReps}>× {set.reps}</Text>
                  <Pressable onPress={() => handleDeleteSet(set.id)} style={styles.deleteSetButton}><Text style={styles.deleteSetText}>Borrar</Text></Pressable>
                </View>
              ))}
              {detailSets.length === 0 && <Text style={styles.bodyCopy}>Esta sesión todavía no tiene series registradas.</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SessionRow({ session, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.sessionRow, pressed && styles.pressedRow]}>
      <View style={styles.sessionDateBlock}><Text style={styles.sessionDay}>{new Date(`${session.sessionDate}T12:00:00`).getDate()}</Text><Text style={styles.sessionMonth}>{new Date(`${session.sessionDate}T12:00:00`).toLocaleDateString('es', { month: 'short' }).toUpperCase()}</Text></View>
      <View style={styles.flex}><Text style={styles.exerciseName}>Entrenamiento</Text><Text style={styles.exerciseGroup}>{formatDate(session.sessionDate)}</Text></View>
      <Text style={styles.optionArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.paper, paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight : 0 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.paper },
  topBar: { height: 64, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },
  brandName: { color: COLORS.ink, fontSize: 12, fontWeight: '800' },
  avatarButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.palePurple, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.deepPurple, fontWeight: '800', fontSize: 14 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingHorizontal: 24, paddingBottom: 14, borderBottomWidth: 1, borderColor: COLORS.line },
  tab: { flex: 1, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 20, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.deepPurple },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: COLORS.white },
  pageContent: { paddingHorizontal: 24, paddingTop: 25, paddingBottom: 36 },
  pageHeading: { marginBottom: 23 },
  eyebrow: { color: COLORS.deepPurple, fontSize: 10, fontWeight: '800', marginBottom: 9 },
  pageTitle: { color: COLORS.ink, fontSize: 36, fontWeight: '800', marginBottom: 5 },
  bodyCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  startPanel: { backgroundColor: COLORS.deepPurple, borderRadius: 8, padding: 20, gap: 22 },
  startPanelText: { gap: 8 },
  panelKicker: { color: COLORS.violet, fontSize: 10, fontWeight: '800' },
  panelTitle: { color: COLORS.white, fontSize: 22, fontWeight: '800' },
  panelBody: { color: '#E5D6FF', fontSize: 13, lineHeight: 19 },
  primaryButton: { minHeight: 50, paddingHorizontal: 18, backgroundColor: COLORS.purple, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  primaryButtonSecondary: { minHeight: 44, paddingHorizontal: 18, backgroundColor: COLORS.palePurple, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 8 },
  primaryButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  disabledButton: { opacity: 0.48 },
  pressedButton: { opacity: 0.82 },
  workoutPanel: { backgroundColor: COLORS.white, borderRadius: 8, padding: 18, gap: 14, borderWidth: 1, borderColor: COLORS.line },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 5 },
  counterBadge: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.palePurple },
  counterNumber: { color: COLORS.deepPurple, fontSize: 18, fontWeight: '800' },
  counterCaption: { color: COLORS.deepPurple, fontSize: 8, fontWeight: '800' },
  fieldGroup: { gap: 7 },
  fieldLabel: { color: COLORS.ink, fontSize: 12, fontWeight: '700' },
  input: { minHeight: 48, paddingHorizontal: 13, borderWidth: 1, borderColor: COLORS.line, borderRadius: 5, color: COLORS.ink, fontSize: 15, backgroundColor: COLORS.white },
  selectorButton: { minHeight: 50, paddingHorizontal: 13, borderWidth: 1, borderColor: COLORS.line, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorText: { color: COLORS.ink, fontSize: 14, fontWeight: '600' },
  placeholder: { color: '#909991', fontWeight: '400' },
  selectorArrow: { color: COLORS.deepPurple, fontSize: 22 },
  measureRow: { flexDirection: 'row', gap: 12 },
  measureField: { flex: 1 },
  timerCard: { backgroundColor: COLORS.lavender, borderRadius: 8, padding: 14, gap: 6 },
  timerText: { color: COLORS.deepPurple, fontSize: 30, fontWeight: '800' },
  timerButton: { alignSelf: 'flex-start', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  timerButtonText: { color: COLORS.deepPurple, fontSize: 12, fontWeight: '800' },
  referenceCard: { backgroundColor: COLORS.palePurple, borderRadius: 8, padding: 14, gap: 5 },
  referenceTitle: { color: COLORS.deepPurple, fontSize: 18, fontWeight: '800' },
  referenceText: { color: COLORS.ink, fontSize: 12, lineHeight: 18 },
  finishButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  finishButtonText: { color: COLORS.deepPurple, fontSize: 13, fontWeight: '800' },
  notice: { color: COLORS.error, fontSize: 13, lineHeight: 19 },
  recentSection: { marginTop: 26, gap: 11 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800' },
  linkText: { color: COLORS.deepPurple, fontSize: 12, fontWeight: '800' },
  routineCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, padding: 14, gap: 10 },
  routineList: { gap: 5 },
  routineItem: { color: COLORS.ink, fontSize: 12, lineHeight: 18 },
  routineEditorRow: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, padding: 12, gap: 12, marginBottom: 12 },
  routineExerciseSelector: { minHeight: 46, borderWidth: 1, borderColor: COLORS.line, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 12 },
  sessionRow: { minHeight: 70, paddingVertical: 11, borderBottomWidth: 1, borderColor: COLORS.line, flexDirection: 'row', alignItems: 'center', gap: 14 },
  pressedRow: { opacity: 0.7 },
  sessionDateBlock: { width: 44, height: 48, backgroundColor: COLORS.lavender, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  sessionDay: { color: COLORS.deepPurple, fontSize: 17, fontWeight: '800' },
  sessionMonth: { color: COLORS.deepPurple, fontSize: 8, fontWeight: '800' },
  exerciseName: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  exerciseGroup: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  optionArrow: { color: COLORS.muted, fontSize: 23 },
  emptyState: { paddingVertical: 32, gap: 13, alignItems: 'flex-start' },
  emptyMark: { color: COLORS.deepPurple, fontSize: 36, fontWeight: '800' },
  emptyTitle: { color: COLORS.ink, fontSize: 19, fontWeight: '800' },
  footerNote: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 27 },
  inlineLoader: { marginVertical: 20 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(22, 32, 27, 0.42)' },
  exerciseSheet: { maxHeight: '78%', backgroundColor: COLORS.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 23, paddingTop: 10, paddingBottom: 22 },
  detailSheet: { maxHeight: '78%', backgroundColor: COLORS.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 23, paddingTop: 10, paddingBottom: 22 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#C5CCC2', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { color: COLORS.ink, fontSize: 23, fontWeight: '800' },
  closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: COLORS.white },
  closeButtonText: { color: COLORS.ink, fontSize: 25, lineHeight: 28 },
  exerciseList: { marginTop: 13 },
  exerciseOption: { minHeight: 66, borderBottomWidth: 1, borderColor: COLORS.line, flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.palePurple, alignItems: 'center', justifyContent: 'center' },
  exerciseDotText: { color: COLORS.deepPurple, fontSize: 14, fontWeight: '800' },
  detailSetRow: { minHeight: 63, borderBottomWidth: 1, borderColor: COLORS.line, flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailMeasure: { color: COLORS.deepPurple, fontSize: 14, fontWeight: '800' },
  detailReps: { minWidth: 35, color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  deleteSetButton: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.lavender },
  deleteSetText: { color: COLORS.deepPurple, fontWeight: '700', fontSize: 12 },
  authContainer: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 23, paddingBottom: 32 },
  authHeadingWrap: { marginTop: 56, marginBottom: 30 },
  authHeading: { color: COLORS.ink, fontSize: 37, fontWeight: '800', marginBottom: 10 },
  authForm: { gap: 16 },
  segmentRow: { flexDirection: 'row', backgroundColor: '#E8EAE2', borderRadius: 6, padding: 3 },
  segment: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  segmentActive: { backgroundColor: COLORS.white },
  segmentText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: COLORS.ink },
  authSwitch: { alignItems: 'center', paddingVertical: 9 },
  authSwitchText: { color: COLORS.deepPurple, fontSize: 13, fontWeight: '800' },
});

export default App;
