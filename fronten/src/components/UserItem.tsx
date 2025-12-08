import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  item: any;
  onToggleActive?: (item: any) => void;
  onChangeRole?: (item: any) => void;
};

const UserItem: React.FC<Props> = ({ item, onToggleActive, onChangeRole }) => {
  const role = item.rol || (item.roles && item.roles[0]) || 'USER';
  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.title}>{item.nombre || item.email || item.username || `#${item.id}`}</Text>
        <Text style={styles.sub}>Rol: {role}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={() => onToggleActive && onToggleActive(item)}>
            <Text style={styles.btnText}>{item.activo ? 'Desactivar' : 'Activar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.green]} onPress={() => onChangeRole && onChangeRole(item)}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Cambiar Rol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 1 },
  body: {},
  title: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#64748b', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#e6eef0', marginRight: 8 },
  btnText: { fontWeight: '600', color: '#0f172a' },
  green: { backgroundColor: '#16a34a' },
});

export default UserItem;
