const PERMISSIONS = {
    GUEST: [
        'viewActiveTradeCount',
        'viewPublicUserProfiles',
        'viewMessageHistory',
        'is-users-online',
        //Room stuff
        'checkRoom',
    ],
    MEMBER: [
        'createTrade',
        'acceptTrade',
        'cancelOwnTrade',
        'viewActiveTrades',
        'sendMessage',
        'giveRep',
        'checkUserStatus',
        //Room stuff
        'createRoom',
        'joinRoom',
    ],
    ADMIN: [
        'viewAllUserData',
        'banUser',
    ],
};

const ROLE_HIERARCHY = {
    GUEST: [],
    MEMBER: ['GUEST'],
    ADMIN: ['GUEST', 'MEMBER']
};

// Cache for role permissions
const rolePermissionsCache = new Map();

const getAllPermissionsForRole = (role) => {
    if (rolePermissionsCache.has(role)) {
        return rolePermissionsCache.get(role);
    }

    let allPermissions = new Set(PERMISSIONS[role] || []);

    const addInheritedPermissions = (currentRole) => {
        (ROLE_HIERARCHY[currentRole] || []).forEach(inheritedRole => {
            (PERMISSIONS[inheritedRole] || []).forEach(permission => allPermissions.add(permission));
            addInheritedPermissions(inheritedRole);
        });
    };

    addInheritedPermissions(role);
    const permissionsArray = Array.from(allPermissions);
    rolePermissionsCache.set(role, permissionsArray);
    return permissionsArray;
};

const hasPermission = (userRole, permission) => {
    const allPermissions = getAllPermissionsForRole(userRole);
    return allPermissions.includes(permission);
};

const checkUserPermission = (socket, permission) => {
    if (!socket.userPermissions) {
        const userRole = socket.auth ? (socket.user.role || 'MEMBER') : 'GUEST';
        socket.userPermissions = new Set(getAllPermissionsForRole(userRole));
    }
    return socket.userPermissions.has(permission);
};

// Function to clear cache if permissions structure changes
const clearPermissionCache = () => {
    rolePermissionsCache.clear();
};

module.exports = { checkUserPermission, getAllPermissionsForRole, clearPermissionCache };