window.buildTreeItems = function(deptTree, treeItems)
{
    if(typeof(treeItems) == 'undefined') treeItems = [];

    // 创建一个映射表，用于快速查找节点
    var nodeMap = {};
    var roots = [];

    // 首先创建所有节点
    for(var i = 0; i < deptTree.length; i++)
    {
        let dept = deptTree[i];
        let node = {key: dept.id, text: dept.name};
        nodeMap[dept.id] = node;
    }

    // 然后建立父子关系
    for(var i = 0; i < deptTree.length; i++)
    {
        let dept = deptTree[i];
        let node = nodeMap[dept.id];

        if(dept.pId === 0 || !nodeMap[dept.pId])
        {
            // 如果父ID为0或者是根节点，或者父节点不存在，则作为根节点
            roots.push(node);
        }
        else
        {
            // 否则，将其添加到父节点的items中
            var parentNode = nodeMap[dept.pId];
            if(!parentNode.items)
            {
                parentNode.items = [];
            }
            parentNode.items.push(node);
        }
    }

    return roots;
};

window.appendItems = function(treeItems, treeItem, pid)
{
    if(pid == 0)
    {
        treeItems.push(treeItem);
        return treeItems;
    }

    for(i in treeItems)
    {
        hasChild = typeof(treeItems[i].items) != 'undefined';
        if(treeItems[i].key == pid)
        {
            if(!hasChild) treeItems[i].items = [];
            hasCurrentItem = false;
            for(j in treeItems[i].items)
            {
                if(treeItems[i].items[j].key == treeItem.key) hasCurrentItem = true;
            }
            if(!hasCurrentItem) treeItems[i].items.push(treeItem);
        }
        else if(hasChild)
        {
            treeItems[i].items = appendItems(treeItems[i].items, treeItem, pid);
        }
    }
    return treeItems;
};

window.submitSelectedDepts = function()
{
    var selectedDepts = [];
    $('#deptList').find('.item-checkbox.checked').each(function()
    {
        id = $(this).closest('.tree-item').attr('z-key');
        selectedDepts.push(id);
    });
    if(selectedDepts.length == 0) return zui.Modal.alert(noDeptError);

    var link = $.createLink('webhook', 'bind', "id=" + webhookID);
    link    += link.indexOf('?') >= 0 ? '&' : '?';
    link    += "selectedDepts=" + selectedDepts.join(',');
    $('.actions .save').attr('disabled', 'disabled');
    loadPage(link);
};

window.loadDeptTree = function()
{
    if(webhookType == 'feishuuser')
    {
        $.getJSON(feishuUrl, function(deptTree)
        {
            $('#loadPrompt').remove();
            tree = new zui.Tree('#deptList', {checkbox: true, checkOnClick: true, defaultNestedShow: true, items: buildTreeItems(deptTree)});
        });
    }
    else
    {
        tree = new zui.Tree('#deptList', {checkbox: true, checkOnClick: true, defaultNestedShow: true, items: buildTreeItems(deptTree)});
        $('#loadPrompt').remove();
    }
};
