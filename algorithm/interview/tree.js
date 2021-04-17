var users = [
    {
        id: 'uid1',
        name: 'xx',
        checked: true,
        children: [{
            id: 'uid3',
            name: 'xx',
            checked: true,
            // ...
        }]
    },
    {
        id: 'uid2',
        name: 'xx',
        checked: true,
        children: [{
            id: 'uid4',
            name: 'xx',
            checked: true,
            // ...
        }]
    }
]
var uids = ['uid1', 'uid2', 'uid3'];
var blackList= new Set(uids);
function setChecked(users, blackList, flag) {
    if (!users || !users.length) {return; }
    users.forEach((user) => {
        if (blackList.has(user.id)) {
            user.checked = flag;
        }
        if (!user.children || !user.children.length) {return; }
        setChecked(user.children, blackList, flag);
    });
}

setChecked(users, blackList, false);
console.log(users);