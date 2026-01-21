/* Binary Tree Class */
#include <iostream> 

struct node
{
  int key_value;
  node *left;
  node *right;
};

class btree
{
  public:
    btree();
    ~btree();

    void insert(int key);
    node *search(int key);
    void destroy_tree();

  private:
    void insert(int key, node *leaf);
    node *search(int key, node *leaf);
    void destroy_tree(node *leaf);

    node *root;
};

// Constructor
btree::btree()
{
  root = NULL;
}

// Destructor
btree::~btree() {
    
}

// Insert
void btree::insert(int key)
{
    if (root != NULL) {
        insert(key, root);
    }
    else
    {
        root = new node;
        root->key_value = key;
        root->left = NULL;
        root->right = NULL;
    }
}

void btree::insert(int key, node *leaf)
{
    if (key < leaf->key_value) {
        if (leaf->left != NULL)
            insert(key, leaf->left);
        else
        {
            leaf->left = new node;
            leaf->left->key_value = key;
            leaf->left->left = NULL; // sets the left child of the child node to null
            leaf->left->right = NULL; // sets the right child of the child node to null
        }
    }
    else if (key >= leaf->key_value)
    {
        if (leaf->right != NULL)
            insert(key, leaf->right);
        else
        {
            leaf->right = new node;
            leaf->right->key_value = key;
            leaf->right->left = NULL; // sets the left child of the child node to null
            leaf->right->right = NULL; // sets the right child of the child node to null
        }
    }
}

// Search
node *btree::search(int key)
{
    return search(key, root);
}

node *btree::search(int key, node *leaf)
{
    if (leaf != NULL)
    {
        if (key == leaf->key_value)
            return leaf;
        if (key < leaf->key_value)
            return search(key, leaf->left);
        if (key >= leaf->key_value)
            return search(key, leaf->right);
    }
    else return NULL;
}

// Destroy
void btree::destroy_tree()
{
    destroy_tree(root);
}

void btree::destroy_tree(node *leaf)
{
    if (leaf != NULL)
    {
        destroy_tree(leaf->left);
        destroy_tree(leaf->right);
        delete leaf;
    }
}